import pandas as pd
from sklearn.cluster import DBSCAN
from pathlib import Path

# Load telemetry
telemetry = pd.read_csv(Path('../data/telemetry.csv').resolve())
X = telemetry[['Easting', 'Northing', 'WaterDepth']].head(10619) # for now only first leg of journey

# Perform clustering
db = DBSCAN(eps=0.15, min_samples=10).fit(X)
X_labeled = X.copy(deep=True)
X_labeled['Label'] = db.labels_
X_labeled.head(5)

# Denoise dataset
X_denoised = X_labeled[X_labeled['Label'] != -1]
print(f'{X_labeled.shape[0] - X_denoised.shape[0]} points removed')

# Add placeholder columns to put file in correct format
X_denoised.assign(Date='20-02-27')
X_denoised.assign(Time='20:50:47.502')
X_denoised.assign(Roll=-6.3)
X_denoised.assign(Pitch=2.0)
X_denoised.assign(Heading=19.9)

# Output to CSV to be parsed by server
# TODO: Ideally we output directly to JSON so there's one less step
X_denoised.to_csv(Path('../data/telemetry_denoised.csv').resolve(), index=False)