from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

dbuser     = 'luke'
dbpassword = ''
dbhost     = '127.0.0.1'
database   = 'localchat'

engine  = create_engine('mysql+mysqlconnector://' + dbuser + ':' + dbpassword + '@' + dbhost + '/' + database) # Create a SQLAlchemy engine, echo = True
Base    = declarative_base() # Create a base class for declarative models
Session = sessionmaker(bind=engine) # Create a session to interact with the database

# def get_db():
#     db = Session()
#     try:
#         yield db
#     finally:
#         db.close()

# def list_tables() -> list:
#     inspector   = inspect(engine)
#     table_names = inspector.get_table_names()
#     return table_names