# Landsat_Temperature_Data
This repository is designed to download and process the Band 10 and Band 11 Data from Landsat 8 and 9. The javascript files will download the data from 
Google Earth Engine and export them to Google Drive. After downloading the files from Google Drive, the jupyter notebook script can be used to process the data further. 
The notebook is designed to convert the Digital Numbers to Temperature Values. It reads each file, extracts the constant values from metadata, extracts the band data, and converts the data to temperature values. The result is saved as a Tiff file.
