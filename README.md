# Point Cloud Outlier Detection

This project revolves around detecting outliers in ROV (remotely operated vehicle) telemetry data in order to improve a 3D visualisation thereof.

This repository contains files for a web server written in C# that serves static web files. The backend contains an endpoint (/api/Viewer/RovCampaignData) which serves JSON data read from the telemetry file.
The frontend is a ThreeJS scene that renders each point around a model of a theoretical underwater structure and an ROV. The ROV can move along the points to "playback" each leg (or route) of the campagin (the overall journey undertaken by the ROV).

## TODO
- Include normalised telemetry data to be used by the project
- Include DBSCAN code to filter and format the raw telemetry based on user inputs and output to a file that can be read and served by the API.