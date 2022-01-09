import { useEffect, useState } from "react";

export const usePolicyMetadatas = (policyIds) => {
  const [policyMetadatas, setPolicyMetadatas] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMetadatas = async (policyIds) => {
      try {
        const metadatas = await Promise.all(
          policyIds.map(async (policyId) => {
            const response = await fetch(
              `https://api.opencnft.io/1/policy/${policyId}`
            );
            return await response.json();
          })
        );

        if (metadatas.length === 1) {
          if (metadatas[0].statusCode === 404) {
            console.log(
              "usePolicyMetadatas: this collection is not in opencnft",
              policyIds
            );
          }
        }

        const validMetadatas = metadatas.filter(
          (metadata) => metadata.policy !== undefined
        );
        setPolicyMetadatas(validMetadatas);
      } catch (error) {
        // console.error(
        //   `Unexpected error in usePolicyMetadatas. [Message: ${error.message}]`
        // );
        setLoadingData(false);
        setErrorMessage(error.message);
      }
    };

    if (policyIds?.length > 0) {
      setLoadingData(true);
      fetchMetadatas(policyIds);
      setLoadingData(false);
    }
  }, [policyIds]);

  return [policyMetadatas, loadingData, errorMessage];
};
