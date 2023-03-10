# Point Cloud Outlier Detection

This project revolves around detecting outliers in ROV (remotely operated vehicle) telemetry data in order to improve a 3D visualisation thereof.

This repository contains files for a web server written in C# that serves static web files. The backend contains an endpoint (/api/Viewer/RovCampaignData) which serves JSON data read from the telemetry file.
The frontend is a ThreeJS scene that renders the model of an underwater structure and an ROV, as well as a point cloud based on the telemetry data that visualises the inspection campaign (the complete journey undertaken by the ROV). The user can press a button to run an animation of the ROV traveling along the points of a particular leg (or section) of the campaign as a means of playing it back.

and a point cloud of the inspection campaign.

## Tasks
- ☑ Normalise telemetry dataset
	- ☑ specifically easting and northing columns
- ☑ Use Sklearn's DBSCAN model to perform clustering
- ☐ Use clustering evaluation metrics to qualify the model
	- ☑ DBSCAN features include:
		- ☑ eps = the maximum distance between two samples for one to be considered as in the neighborhood of the other
		- ☑ min_samples = The number of samples (or total weight) in a neighborhood for a point to be considered as a core point.
	- ☐ metrics include:
		- ☑ silhouette coefficient (sklearn)
		- ☐ davies-bouldin score (sklearn)
		- ☐ dunn's index (need to implement)
- ☐ Output a "filtered" dataset by removing the identified outliers
- ☐ Update frontend to allow choosing a specific leg of the journey to view