import os
import pandas as pd
import re
from datetime import datetime


def extract_date(filename: str) -> str:
    # Extract the date information from the filename
    date_str = re.search(r'(\d{8})', filename).group()

    # Convert the date string to a datetime object
    date = datetime.strptime(date_str, '%Y%m%d')

    # Format the datetime object as a string (YYYY-MM-DD) format
    date_formatted = date.strftime("%Y-%m-%d")

    return date_formatted


def generate_metadata(source: str) -> None:
    """
    Generates metadata for remote sensing data sources (s1 or s2).

    Parameters:
    source (str): The remote sensing data source (s1 or s2).

    Returns:
    None: The function saves the metadata in a CSV file with the format "{source}_metadata.csv".

    Raises:
    ValueError: If the input source is not valid (s1 or s2).
    """
    if source == 's2':
        filenames = os.listdir('./s2')
    else:
        raise Exception("Please enter a valid data source (s1 or s2)")

    dates = []
    for idx, file in enumerate(filenames):
        # The files will be accessed from outside of the data directory
        file = f"./data/{source}/{file}"
        filenames[idx] = file
        dates.append(extract_date(file))

    metadata = {'date': dates, 'filename': filenames}
    df = pd.DataFrame(metadata)
    df['date'] = pd.to_datetime(df['date'], format="%Y-%m-%d")

    df.to_csv(f"{source}_metadata.csv", index=False)


if __name__ == "__main__":
    source = str(input("Data source (s1 or s2) : "))
    generate_metadata(source)
