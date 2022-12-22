Sabemos que em algum momento surgirá a necessidade de fazer upload de vários arquivos do lado do cliente por meio de sua aplicação. Em uma rápida pesquisa encontramos perguntas semelhante no StackOverflow de como realizar esse processo porém, por se tratar de AWS as respostas mais aceitas é atraves de uma implementação utilizando a AWS CLI, quando é encontrado algum processo realizado utilizando Javascript é usando o `promise.all` mas certamente não é uma opção do lado do cliente. Também encontraremos algumas implementações usando Python e boto3, mas para um aplicativo que foi escrito em Node.js como fazemos? Certamente existe uma abordagem melhor e mais rápida do que transformar esse script Node.js em Python....

Após algumas pesquisas mais afundo, descobri que a estrutura do arquivo zip tem seu diretório central localizado no final do arquivo e existem cabeçalhos locais que são uma cópia do diretório central, mas não são confiáveis. E os métodos de leitura da maioria das outras bibliotecas de streaming armazenam em buffer todo o arquivo zip na memória, anulando todo o propósito de transmiti-lo em primeiro lugar. Então, aqui está um algoritmo criado usando a biblioteca yauzl (biblioteca de descompactação para Node.js)

### Conteúdo

- [Conteúdo](#content)
- [Processo e Fluxograma](#process)
- [Requisitos para implementação](#requirements)

## Processo

- [ ] O usuário carrega muitos arquivos por meio da aplicação.
- [ ] A aplicativo compacta esses arquivos usando a biblioteca [yazl](https://www.npmjs.com/package/yauzl) e os carrega em um balde S3 no lado do cliente.
- [ ] Um evento `PUT` do AWS S3 aciona a função Lambda.
- [ ] A função Lambda extrai todo o objeto (arquivo .zip) para seu buffer de memória.
- [ ] Ela lê uma entrada e a carrega de volta para o S3.
- [ ] Quando o upload termina, ele segue para a próxima entrada e repete o processo.

<h1 align="center">
    <img width="100%"  alt="" title="" src="./assets/flow/unzip-files-trigger.png" />
</h1>

**⚠️ Este algoritmo NÃO atinge o limite de RAM da função Lambda. Durante os testes o uso máximo de memória foi inferior a 500 MB para extrair um arquivo zip de 254 MB contendo 2,24 GB de arquivos.**

## Requistos para implementação

Antes de criar a sua função Lambda, é **necessário criar uma função IAM para a função Lambda que concede acesso ao Bucket S3**. Para isso, siga os passos abaixo:

1. Siga as etapas em [Criando uma função de execução no console do IAM](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html#permissions-executionrole-console)
2. Na lista de funções do IAM, escolha a função que você acabou de criar.
3. Na guia **Permissões** , escolha **Adicionar política em linha**
4. Escolha a guia **JSON**
5. Insira uma política IAM baseada em recursos que conceda acesso ao seu bucket S3. Para obter mais informações, consulte [Usar políticas baseadas em recursos para AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html)

Exemplo de política IAM que concede acesso a um bucket S3 específico:

**⚠️ Substitua "arn:aws:s3:::AWSDOC-EXAMPLE-BUCKET/\*" pelo nome de recurso da Amazon (ARN) do seu Bucket S3.**

```json
{
  "Version": "2022-12-22",
  "Statement": [
    {
      "Sid": "ExampleStmt",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Effect": "Allow",
      "Resource": ["arn:aws:s3:::AWSDOC-EXAMPLE-BUCKET/*"]
    }
  ]
}
```

Pronto, agora inicie o processo de criação da função Lambda pelo console da AWS, pesquisando por `lambda` e siga os passos abaixo:

1. Pressione o botão **Criar função** (ou Create function)
2. A próxima tela mostra diversas opções para o código da função. Familiarize-se com todas essas opções para trabalhar com as funções do Lambda:

- **Autor do zero (Author from scratch)** - Crie seu próprio código a partir de um exemplo Hello World.
- **Use um projeto (Use a blueprint)** - Os esquemas de código da AWS incluem integrações integradas da AWS com outros serviços e usos comuns. Esses esquemas podem economizar uma quantidade significativa de tempo ao desenvolver funções do Lambda.
- **Imagem do contêiner (Container image)** - As imagens de contêiner armazenadas no Amazon Elastic Container Registry também são úteis para iniciar novas funções do Lambda.
- **Navegue pelo repositório de aplicativos sem servidor (Browse serveless app repository)** No AWS Serverless Application Repository, os usuários podem encontrar vários produtos úteis.
