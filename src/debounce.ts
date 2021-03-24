/** 
 * This is generally what a debounce function looks like, it takes
 * a function to execute, and optionally a delay 
 */
 export function debounce(func, delay = 0) {
  
    /* We create a variable to store a reference to the last `setTimeout` */
    let timeoutId;
    
    /** 
     * And then we return a new function, that whenever called, clears the latest 
     * timeout, essentially cancelling it, and schedules a new timeout 
     */
    return function() {
      
      /** 
       * Because this function closes over the outer function, we'll still 
       * have access to the `timeoutId` declared above. This is useful on 
       * subsequent calls to the 'inner' function. 
       */
      clearTimeout(timeoutId);
      
      /* We then schedule a new timeout, that calls the function that we'd like to execute */
      timeoutId = setTimeout(() => {
        // eslint-disable-next-line prefer-rest-params
        func.apply(this, arguments);
      }, delay);
    }
  }