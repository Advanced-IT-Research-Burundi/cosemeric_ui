import { ref, onMounted, onBeforeUnmount } from 'vue'; 
import io from 'socket.io-client';

export default {
  setup() {
    const socket = ref(null);  
    const notificationMessage = ref("");  

    onMounted(() => {
      socket.value = io('http://localhost:3000'); 

      socket.value.on('notificationReceived', (data) => {
        console.log(data.message); 
        notificationMessage.value = data.message;
      });
    });

    const sendNotificationToBackend = () => {
      const notificationData = { message: 'New notification from client' };
      socket.value.emit('notification', notificationData);
    };

    onBeforeUnmount(() => {
      if (socket.value) {
        socket.value.disconnect();
      }
    });

    return {
      notificationMessage,
      sendNotificationToBackend,
    };
  },
};
