from pydantic import BaseModel


class ImportReportResponse(BaseModel):

    batch_id: int

    filename: str

    imported_rows: int

    total_rows: int

    status: str