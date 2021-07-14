import gspread
from oauth2client.service_account import ServiceAccountCredentials


class GoogleSpread:
    def __init__(self, title: str, path: str) -> None:
        self.scopes = ["https://spreadsheets.google.com/feeds", 'https://www.googleapis.com/auth/spreadsheets',
                       "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]

        self.title = title
        self.credentials = ServiceAccountCredentials.from_json_keyfile_name(
            path, self.scopes)

    def authorize(self) -> gspread.Client:
        client = gspread.authorize(self.credentials)
        return client

    def get_work_sheet(self, client: gspread.Client, name: str) -> gspread.Worksheet:
        work_sheet = client.open(self.title).worksheet(name)
        return work_sheet

    def update_all_records(sef, work_sheet: gspread.Worksheet, records: list):
        work_sheet.clear()
        work_sheet.update(records)
