from app.core.database import engine,Base

from app.modules.users.models import *
from app.modules.signature.models import *
from app.modules.auth.models import *
from app.modules.document.models import *

Base.metadata.create_all(bind=engine)

print("All Tables Created")
