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
          const result = handleSuccess(res);
          setResult([...results, result]);
        })
        .catch(error => {
          const result = handleError(error);
          setReult([...results, result]);
        });
    }
  }, [shouldMakeNewRequest]);

  return results;
}
