# Sequelize Repository

 This is the Sequelize reporistory for this function. It can connect to any SQL based data store.


# TODO
1. This folder is incorrectly called model, it should be called Sequelize based on the data store type that's used for this repository.


## Design decisions
1. The repository folder has an interface file that defines its public interface.
2. Any data storage dependencies must be defined in the data storage specific subfolder, for example the sequelize subfolder is a copy of the repository dedicated to dealing with backend SQL data storage. Other backend storage technologies may be added as subfolder here later.
3. Use singular for folders that contain many items of a type.


