from app.core.database import Base,engine
from app.modules.users.models import *
from app.modules.signature.models import *
from app.modules.auth.models import *
from app.modules.document.models import *


def create_tables():
    print("Database Tabl created Succesfully!")
    Base.metadata.create_all(bind=engine)
    