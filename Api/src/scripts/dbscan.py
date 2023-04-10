import sys
import pandas as pd
from sklearn.cluster import DBSCAN
from pathlib import Path

try:
	basePath = sys.argv[1]

	# Remove old denoised datafile
	Path.unlink(Path(basePath, 'data/telemetry_denoised.csv').resolve(), missing_ok=True)

	start = int(sys.argv[2])
	end = int(sys.argv[3])
	windowed = sys.argv[4]

	# Load telemetry
	telemetry = pd.read_csv(Path(basePath, 'data/telemetry.csv').resolve())
	# Take specified range of data
	X = telemetry.iloc[start:end]
	X = X[['Easting', 'Northing', 'WaterDepth']]

	if windowed == 'true':
		chunks = []
		index = 0
		window = 500

		while index <= X.shape[0]:
			# Get windowed segment (chunk)
			chunk = X.iloc[index:index+window]

			if chunk.shape[0] < 1:
				break

			# Run clustering and append chunk
			db = DBSCAN(eps=0.15, min_samples=12).fit(chunk)
			chunk = chunk.assign(Label=db.labels_)
			chunks.append(chunk)
			index += window

		# Label and denoise data
		for chunk in chunks:
			chunk = chunk[chunk['Label'] != -1]

		X = pd.concat(chunks)
	else:
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
	try:
		X.to_csv(Path(basePath, 'data/telemetry_denoised.csv').resolve(), index=False)
	except Exception as err:
		print('Failed to write file', str(err))
except Exception as err:
	print('error', str(err))