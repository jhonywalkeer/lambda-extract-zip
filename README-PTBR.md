Sabemos que em algum momento surgirá a necessidade de fazer upload de vários arquivos do lado do cliente por meio de sua aplicação. Em uma rápida pesquisa encontramos perguntas semelhante no StackOverflow de como realizar esse processo porém, por se tratar de AWS as respostas mais aceitas é atraves de uma implementação utilizando a AWS CLI, quando é encontrado algum processo realizado utilizando Javascript é usando o `promise.all` mas certamente não é uma opção do lado do cliente. Também encontraremos algumas implementações usando Python e boto3, mas para um aplicativo que foi escrito em Node.js como fazemos? Certamente existe uma abordagem melhor e mais rápida do que transformar esse script Node.js em Python....

Após algumas pesquisas mais afundo, descobri que a estrutura do arquivo zip tem seu diretório central localizado no final do arquivo e existem cabeçalhos locais que são uma cópia do diretório central, mas não são confiáveis. E os métodos de leitura da maioria das outras bibliotecas de streaming armazenam em buffer todo o arquivo zip na memória, anulando todo o propósito de transmiti-lo em primeiro lugar. Então, aqui está um algoritmo criado usando a biblioteca yauzl (biblioteca de descompactação para Node.js)

## Processo

- [ ] O usuário carrega muitos arquivos por meio da aplicação.
- [ ] A aplicativo compacta esses arquivos usando a biblioteca yazl e os carrega em um balde S3 no lado do cliente.
- [ ] Um evento `PUT` do AWS S3 aciona a função Lambda.
- [ ] A função Lambda extrai todo o objeto (arquivo .zip) para seu buffer de memória.
- [ ] Ela lê uma entrada e a carrega de volta para o S3.
- [ ] Quando o upload termina, ele segue para a próxima entrada e repete o processo.

<h1 align="center">
    <img width="100%"  alt="" title="" src="./assets/flow/unzip-files-trigger.png" />
</h1>

**⚠️ Este algoritmo NÃO atinge o limite de RAM da função Lambda. Durante os testes o uso máximo de memória foi inferior a 500 MB para extrair um arquivo zip de 254 MB contendo 2,24 GB de arquivos.**
