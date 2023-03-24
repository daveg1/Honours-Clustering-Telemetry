import sys
import pandas as pd
from sklearn.cluster import DBSCAN
from pathlib import Path

# Remove old denoised datafile
Path.unlink(Path('../data/telemetry_denoised.csv').resolve(), missing_ok=True)

start = int(sys.argv[1])
end = int(sys.argv[2])

# Load telemetry
telemetry = pd.read_csv(Path('../data/telemetry.csv').resolve())
# Take specified range of data
X = telemetry.iloc[start:end]
X = X[['Easting', 'Northing', 'WaterDepth']]

# Perform clustering
db = DBSCAN(eps=0.15, min_samples=10).fit(X)

# Label and denoise data
X['Label'] = db.labels_
X = X[X['Label'] != -1]

# Add placeholder columns to put file in correct format
X = X.assign(
	Date='20-02-27',
	Time='20:50:47.502',
	Roll=-6.3,
	Pitch=2.0,
	Heading=19.9
)

# Remove label as no longer needed
X.drop(columns='Label')

# Output to CSV to be parsed by server
# TODO: Ideally we output directly to JSON so there's one less step
X.to_csv(Path('../data/telemetry_denoised.csv').resolve(), index=False)