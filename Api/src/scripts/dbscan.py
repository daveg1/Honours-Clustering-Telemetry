import sys
import pandas as pd
from sklearn.cluster import DBSCAN
from pathlib import Path

try:
  basePath = sys.argv[1]

  # Remove old denoised datafile
  Path.unlink(
      Path(basePath, 'data/telemetry_denoised.csv').resolve(), missing_ok=True)

  epsilon = float(sys.argv[2])
  min_samples = int(sys.argv[3])
  start = int(sys.argv[4])
  end = int(sys.argv[5])
  windowed = sys.argv[6]

  if epsilon <= 0.0:
    epsilon = 0.1

  if min_samples <= 0:
    min_samples = 11

  # Load telemetry
  telemetry = pd.read_csv(Path(basePath, 'data/telemetry.csv').resolve())
  # Take specified range of data
  X = telemetry.iloc[start:end]
  X = X[['Easting', 'Northing', 'WaterDepth']]

  if windowed == 'true':
    chunks = []
    index = 0
    window = 10000

    while index <= X.shape[0]:
      # Get windowed segment (chunk)
      chunk = X.iloc[index:index+window]

      if chunk.shape[0] < 1:
        break

      # Run clustering and append chunk
      db = DBSCAN(eps=epsilon, min_samples=min_samples).fit(chunk)
      chunk['Label'] = db.labels_
      chunks.append(chunk)
      index += window

    X = pd.concat(chunks)
  else:
    # Perform clustering
    db = DBSCAN(eps=epsilon, min_samples=min_samples).fit(X)

    # Label data
    X['Label'] = db.labels_

  # Denoise data
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
  # X.drop(columns='Label')

  # Output to CSV to be parsed by server
  try:
    X.to_csv(Path(basePath, 'data/telemetry_denoised.csv').resolve())
  except Exception as err:
    print('Failed to write file', str(err))
except Exception as err:
  print('error', str(err))
