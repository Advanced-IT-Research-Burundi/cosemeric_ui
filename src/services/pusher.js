import Pusher from 'pusher-js';

export default {
  data() {
    return {
      notificationMessage: '',
    };
  },
  mounted() {
    const pusher = new Pusher('your-pusher-app-key', {
      cluster: 'your-pusher-cluster',
      forceTLS: true,
    });

    const channel = pusher.subscribe('private-user.' + this.userId);

    channel.bind('App\\Events\\NotificationSent', (data) => {
      this.notificationMessage = data.message;
      console.log('Notification received:', data.message);
    });
  },
};
