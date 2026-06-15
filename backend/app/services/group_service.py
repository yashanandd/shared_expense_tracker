from app.models.grouped import Group
from app.models.memberships import Membership
from datetime import date

def create_group(
    db,
    group_data,
    user_id
):

    group = Group(
        name=group_data.name,
        description=group_data.description,
        created_by=user_id
    )

    db.add(group)
    db.flush()  # Populates group.id before commit

    membership = Membership(
        group_id=group.id,
        user_id=user_id,
        joined_at=date.today()
    )
    db.add(membership)

    db.commit()
    db.refresh(group)

    return group