# search-engine

## Onboarding

### Setting up the dependencies:

This search engine depends on [NodeJS](https://nodejs.org/en/download). It also requires a 
[MongoDB](https://www.mongodb.com) database and a [RabbitMQ](https://www.rabbitmq.com/#getstarted)
channel. 

> If you're planning on using this locally, I recommend you run MongoDB and RabbitMQ
> using [Docker](https://www.docker.com/products/docker-desktop/) (check-out the
> [Setting Up Services Locally](#setting-up-services-locally) section for information
> on the matter).

This search engine depends on a couple libraries. To install them using __NPM__, inside the 
root folder (same folder as this file) run:

```shell
npm ci
```

### Setting up the services

To set up the MongoDB and RabbitMQ services locally, check out the
[Setting Up Services Locally](#setting-up-services-locally) section. If you'd rather use
existing instances, check out the [Configurations](#configurations) section.

### Running the search engine

## Setting up services locally

### Installing Docker

Before getting started, make sure you have a __Docker Daemon__ instance running on your device. 
Refer to the [docker installation process](https://docs.docker.com/engine/install/) to install 
it properly. You may check that it is running by trying the following command:
```shell
docker help
```

If it is running, you'll get a description of the commands available to you. If it isn't... you're
going to be getting and error!

### Running MongoDB

This search engine depends on a NoSQL database to save collections of documents (including webpages
themselves, page graphs and page ranking data). While you could use different volumes for different
collections, we're going to keep it simple here. We're going to run a single instance, and utilize
the built-in volume of that instance.

However, it would be wise, for long-term persistence, to allocate dedicated volume[s] and to link
them with the instance[s].  

To launch a __MongoDB__ instance locally using __Docker__, run the following command:

```shell
docker run --name search-engine.mongodb -d -p 27017:27017 mongo
```

### Running RabbitMQ

This search engine depends on AMQPs to distribute the work across workers. While you could use 
different servers for different streams, we're going to keep it simple here. We're going to run a
single instance, and utilize multiple channels on that instance.

To launch a __RabbitMQ__ instance locally using __Docker__, run the following command:

```shell
docker run --name search-engine.rabbitmq -d -p 5672:5672 rabbitmq
```

## Configurations

If you have specific configurations you'd like to use instead, you may change them in 
the `~/.env` file. Here's a breakdown of the configurations:

| Name                    |         Default | Description                                                                                                                                  |
|-------------------------|----------------:|----------------------------------------------------------------------------------------------------------------------------------------------|
| URL_FRONTIER_URL        | amqp://localhost:5672 | This is the RabbitMQ channel url for the URL Frontier.                                                                                       |
| URL_FRONTIER_QUEUE      | url-frontier | This is the channel's queue dedicated to the URL Frontier.                                                                                   |
| DOWNSTREAM_BROKER_URL   | amqp://localhost:5672 | This is the RabbitMQ channel url for the Downstream Broker.                                                                                  |
| DOWNSTREAM_BROKER_QUEUE | downstream-broker | This is the channel's queue dedicated to the Downstream Broker.                                                                              |
| STORE_URL | mongodb://localhost:27017/search-engine | This is the mongodb connection string. It includes everything from the domain, the port, database name, to the authentication, if specified. |
