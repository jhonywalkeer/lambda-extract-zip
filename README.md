We know that at some point there will be a need to upload multiple client-side files through your application. In a quick search we found similar questions on StackOverflow on how to carry out this process, however, because it is AWS the most accepted answers are through an implementation using the AWS CLI, when a process is found using Javascript it is using `promise.all ` but it's certainly not a client-side option. We will also find some implementations using Python and boto3, but for an application that was written in Node.js how do we do it? Surely there is a better and faster approach than turning this Node.js script into Python....

After some more research I found that the zip file structure has its core directory located at the end of the file and there are local headers which are a copy of the core directory but are not reliable. And the read methods of most other streaming libraries buffer the entire zip file in memory, defeating the whole purpose of streaming it in the first place. So here is an algorithm created using yauzl library (unzip library for Node.js)

## Process

- [ ] The user uploads many files through the application.
- [ ] The application compresses these files using the yazl library and loads them into an S3 Bucket on the client side.
- [ ] A `PUT` event from AWS S3 triggers the Lambda function.
- [ ] The Lambda function extracts the entire object (.zip file) into its memory buffer.
- [ ] It reads an entry and loads it back to S3.
- [ ] When the upload is complete, it moves on to the next entry and repeats the process.

<h1 align="center">
    <img width="100%"  alt="" title="" src="./assets/flow/unzip-files-trigger.png" />
</h1>

**⚠️ This algorithm does NOT hit the Lambda function RAM limit. During testing the maximum memory usage was less than 500MB to extract a 254MB zip file containing 2.24GB of files.**
