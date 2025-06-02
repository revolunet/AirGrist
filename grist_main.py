"""Sample script to push some data to Grist."""
from dataclasses import asdict, dataclass
from enum import Enum
from typing import Any
import requests
from grist_config import GRIST_API_KEY, GRIST_API_URL


class FieldInGristApiTypeEnum(str, Enum):
    TEXT = "Text" 
    NUMERIC = "Numeric" 
    INT = "Int"
    # TODO(AD): Support other types: https://support.getgrist.com/api/#tag/columns/operation/addColumns


@dataclass
class FieldInGristApi:
    label: str
    type: FieldInGristApiTypeEnum


@dataclass
class ColumnInGristApi:
    id: str
    fields: FieldInGristApi  # The s in "fields" mirrors the Grist API but it's actually not a list


@dataclass
class TableInGristApi:
    id: str  # The name of the table
    columns: list[ColumnInGristApi]


class GristApiClient:

    def __init__(self, api_url: str, api_key: str) -> None:
        self._api_url = api_url
        self._api_key = api_key
        self._api_headers = {
            'Authorization': f'Bearer {GRIST_API_KEY}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

    def create_document(self, workspace_id: int, document_name: str) -> str:
        response = requests.post(
            f"{GRIST_API_URL}/api/workspaces/{workspace_id}/docs", 
            headers=self._api_headers,
            json={"name": document_name}, 
        )
        response.raise_for_status()
        document_id = response.json()
        return document_id
    

    def add_tables_to_document(self, document_id: str, list_of_tables: list[TableInGristApi]) -> list[str]:
        response = requests.post(
            f"{GRIST_API_URL}/api/docs/{document_id}/tables", 
            headers=self._api_headers,
            json={"tables": [asdict(table) for table in list_of_tables]}, 
        )
        response.raise_for_status()
        response_json = response.json()

        all_tables_ids = [tab_json["id"] for tab_json in response_json["tables"]]
        return all_tables_ids


    def add_records_to_table(self, document_id: str, table_id: str, records_to_add: list[dict[str, Any]]) -> None:
        grist_formatted_records = []
        for record in records_to_add:
            grist_formatted_records.append({
                "fields": record
            })

        response = requests.post(
            f"{GRIST_API_URL}/api/docs/{document_id}/tables/{table_id}/records", 
            headers=self._api_headers,
            json={"records": grist_formatted_records}, 
        )
        response.raise_for_status()        
        

class TableColumnTypeEnum(Enum):
    TEXT = 1
    NUMERIC = 2
    INTEGER = 3
    

if __name__ == "__main__":
    # TODO(AD): Auto-create a workspace ?
    WORKSPACE_ID = 147018
    DOCUMENT_NAME = "Airtable Import"  # The Grist doc that will contain the tables we'ere importing

    # The table(s) to import
    _SAMPLE_TABLE_1_SCHEMA = TableInGristApi(
        id="Participants",
        columns=[
            ColumnInGristApi(id="nom", fields=FieldInGristApi(label="nom", type=FieldInGristApiTypeEnum.TEXT)),
            ColumnInGristApi(id="age", fields=FieldInGristApi(label="age", type=FieldInGristApiTypeEnum.INT)),
        ]
    )
    _SAMPLE_TABLE_1_RECORDS = [
        {"nom": "Julien", "age": 28},
        {"nom": "Milo", "age": 24},
        {"nom": "Gilles", "age": 25},
        {"nom": "Ryan", "age": 26},
        {"nom": "Denis", "age": 27},
        {"nom": "Alban", "age": 28},
    ]

    grist_client = GristApiClient(api_url=GRIST_API_URL, api_key=GRIST_API_KEY)

    # Create the document
    doc_id = grist_client.create_document(workspace_id=WORKSPACE_ID, document_name=DOCUMENT_NAME)
    print(f"Created document with ID {repr(doc_id)}")

    # Add the tables we'd like to import to it
    all_table_ids = grist_client.add_tables_to_document(document_id=doc_id, list_of_tables=[_SAMPLE_TABLE_1_SCHEMA])
    print(f"Created tables with ID {repr(all_table_ids)}")
    table1_grist_id = all_table_ids[0]  # We know we only created 1 table in this sample script

    # Add the records to each table we're importing
    grist_client.add_records_to_table(document_id=doc_id, table_id=table1_grist_id, records_to_add=_SAMPLE_TABLE_1_RECORDS)
    print(f"Done adding {len(_SAMPLE_TABLE_1_RECORDS)} records to table with ID {table1_grist_id}")
