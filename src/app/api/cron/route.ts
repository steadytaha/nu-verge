// import cron from 'node-cron';
// import axios from 'axios';

// class CronScheduler {
//   constructor(baseUrl = 'https://localhost:3000') {
//     this.baseUrl = baseUrl;
//   }

//   /**
//    * Schedule a POST request
//    * @param {Object} options
//    * @param {number} options.minutes - Minutes from now (default: 0)
//    * @param {number} options.hours - Hours from now (default: 0)
//    * @param {number} options.days - Days from now (default: 0)
//    * @param {string} options.endpoint - API endpoint (default: '/api/cron')
//    * @param {Object} options.payload - Custom payload to send
//    * @returns {Object} - Information about scheduled task
//    */
//   scheduleRequest({
//     minutes = 0,
//     hours = 0,
//     days = 0,
//     endpoint = '/api/cron',
//     payload = {}
//   } = {}) {
//     // Calculate target time
//     const now = new Date();
//     const scheduleTime = new Date(now.getTime() + 
//       (minutes * 60000) +    // Convert minutes to milliseconds
//       (hours * 3600000) +    // Convert hours to milliseconds
//       (days * 86400000)      // Convert days to milliseconds
//     );

//     const minute = scheduleTime.getMinutes();
//     const hour = scheduleTime.getHours();
//     const dayOfMonth = scheduleTime.getDate();
//     const month = scheduleTime.getMonth() + 1;
//     const dayOfWeek = scheduleTime.getDay();

//     const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

//     console.log(`Task scheduled for: ${scheduleTime.toLocaleString()}`);

//     // Create the cron job
//     const job = cron.schedule(cronExpression, async () => {
//       try {
//         console.log('Executing scheduled POST request...');
        
//         const response = await axios.post(`${this.baseUrl}${endpoint}`, {
//           ...payload,
//           timestamp: new Date().toISOString(),
//           scheduledTime: scheduleTime.toISOString()
//         });
        
//         console.log('POST request successful:', response.status);
//         console.log('Response data:', response.data);
        
//         // Stop the cron job after execution
//         job.stop();
//       } catch (error) {
//         console.error('Error executing POST request:', error.message);
//         job.stop();
//       }
//     }, {
//       scheduled: true,
//       timezone: "UTC"
//     });

//     return {
//       scheduledTime: scheduleTime,
//       cronExpression,
//       stop: () => job.stop(),
//       endpoint: `${this.baseUrl}${endpoint}`
//     };
//   }
// }