const NoAssetFound = ({ state_collection, policyIds }) => {
  return (
    <section className="hero is-medium">
      <div className="hero-body">
        <div className="container has-text-centered">
          {state_collection.loading ? (
            <>
              <h1>
                <span
                  className="icon"
                  style={{ fontSize: "100px", marginBottom: "50px" }}
                >
                  <i className="fas fa-truck-loading"></i>
                </span>
              </h1>
              <p className="title">Fetching assets</p>
              <p className="subtitle">This may take awhile...</p>
            </>
          ) : (
            <></>
          )}
          {!state_collection.loading && policyIds ? (
            policyIds.some(
              (r) =>
                Object.keys(state_collection.policies_collections).indexOf(r) >=
                0
            ) ? (
              <>
                <h1>
                  <span
                    className="icon"
                    style={{ fontSize: "100px", marginBottom: "50px" }}
                  >
                    <i className="far fa-times-circle"></i>
                  </span>
                </h1>
                <p className="title">No assets</p>
                <p className="subtitle">
                  This policy ID does not exist or does not contain any assets.
                </p>
              </>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
        </div>
      </div>
    </section>
  );
};

export default NoAssetFound;
