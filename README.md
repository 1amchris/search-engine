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
docker --version
```

If it is running, you'll get a short answer giving you the used version of docker. If it isn't... you're
going to be getting and error!

### Installing Mongo Shell

Another dependency is Mongo Shell, make sure you have a __Mongo Shell__ executable in your $PATH.
Refer to the [MongoDB Community Edition installation process](https://www.mongodb.com/docs/manual/administration/install-community/) to install
it properly. You may check that it is running by trying the following command:
```shell
mongosh --version
```

If it is running, you'll get a short answer giving you the used version of mongosh. If it isn't... you're
going to be getting and error!

### Running services

This search engine depends on a NoSQL database to save collections of documents (including webpages
themselves, page graphs and page ranking data). While you could use different volumes for different
collections, we're going to keep it simple here. We're going to run a single instance, but we're going 
to have to make it into a replica set due to functionalities only available to replica sets.

This search engine also depends on AMQPs to distribute the work across workers. While you could use
different servers for different streams, we're going to, again, keep it simple here. We're going to run a
single instance, and utilize multiple channels on that instance.

To launch all services locally using __Docker__, run the following command:

```shell
sh ./setup-env.sh
```

### Verifying the services are running

Additionally, you may check that all the containers are up and running using the following command:

```shell
docker ps
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
