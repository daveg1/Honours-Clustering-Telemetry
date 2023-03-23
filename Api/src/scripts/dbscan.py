import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn import metrics
import itertools
from pathlib import Path

# Load telemetry
telemetry = pd.read_csv(Path('../data/telemetry.csv').resolve())
X = telemetry[['Easting', 'Northing', 'WaterDepth']].head(10619) # for now only first leg of journey

def num_of_clusters(db):
	return len(set(db.labels_)) - (1 if -1 in db.labels_ else 0)

# Grid search function to find best combination of options
def grid_search_dbscan(data: pd.DataFrame, options: dict[str, tuple], verbose=False) -> list[dict[str, int]]:
	results = []

	# Iterate through all combinations of options
	# And perform a DBSCAN evaluation on each
	option_combs = itertools.product(*options.values())

	for eps, min_samples in list(option_combs):
		if verbose: print(f'Running eps={eps}, min_samples={min_samples}')

		db = DBSCAN(eps=eps, min_samples=min_samples).fit(data)
		labels = db.labels_

		# Get estimated number of clusters and noise points
		clusters = num_of_clusters(db)
		noise = list(labels).count(-1)

		# Silhouette Coefficient
		silhouette = metrics.silhouette_score(X, labels)

		# Davies-Bouldin Score
		davies_bouldin = metrics.davies_bouldin_score(X, labels)

		if verbose: print(f'Finished with silhouette={silhouette}')

		results.append({
			"params": { "eps": eps, "min_samples": min_samples },
			"eval": {
				"clusters": clusters,
				"noise": noise,
				"silhouette": silhouette,
				"davies_bouldin": davies_bouldin
			}
		})

	return results

# Run grid search with the following options
options = {
	"eps": [0.1, 0.15, 0.2, 0.3],
	"min_samples": [2, 5, 10]
}

results = grid_search_dbscan(X, options)

# Find best result
highest = 0
best = None

for res in results:
	sil = res['eval']['silhouette']

	if sil > highest:
		highest = sil
		best = res

print(f'Best result was:\n\t{best["eval"]}\nusing params:\n\t{best["params"]}')

# Now perform clustering with best options
db = DBSCAN(eps=best['params']['eps'], min_samples=best['params']['min_samples']).fit(X)
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