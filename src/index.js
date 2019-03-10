import { useState, useEffect } from "react";
export default function useMaxConcurrentFetch({
  url,
  options,
  max,
  handleSuccess,
  handleError,
  shouldMakeNewRequest = true
}) {
  const [inFlightRequests, setInFlightRequests] = useState([]);
  const [results, setResult] = useState([]);
  
  useEffect(() => {
    if (shouldMakeNewRequest) {
      let isOldRequest = false;
      const abortController = new AbortController();
      setInFlightRequests(abortController);
      if (inFlightRequests.length > max) {
        const requestsToAbortTotal = inFlightRequests.length - max;
        for (let i = 0; i < requestsToAbortTotal; i++) {
          inFlightRequests[i].abort();
        }
        setInFlightRequests(inFlightRequests.slice(requestsToAbortTotal));
      }
      fetch(url, { signal: abortController.signal, ...options })
        .then(res => {
          if (isOldRequest) {
            return;
          }
          const result = handleSuccess(res);
          setResult([...results, result]);
        })
        .catch(error => {
          if (isOldRequest) {
            return;
          }
          const result = handleError(error);
          setReult([...results, result]);
        });
    }

    return () => {
      isOldRequest = true;
    };
  }, [shouldMakeNewRequest]);

  return results;
}
