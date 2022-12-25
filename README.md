# Point Cloud Outlier Detection

This project revolves around detecting outliers in ROV (remotely operated vehicle) telemetry data in order to improve a 3D visualisation thereof.

This repository contains files for a web server written in C# that serves static web files. The backend contains an endpoint (/api/Viewer/RovCampaignData) which serves JSON data read from the telemetry file.
The frontend is a ThreeJS scene that renders the model of an underwater structure and an ROV, as well as a point cloud based on the telemetry data that visualises the inspection campaign (the complete journey undertaken by the ROV). The user can press a button to run an animation of the ROV traveling along the points of a particular leg (or section) of the campaign as a means of playing it back.

and a point cloud of the inspection campaign.

## TODO
- Include normalised telemetry data to be used by the project
- Include DBSCAN code to filter and format the raw telemetry based on user inputs and output to a file that can be read and served by the API.