import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.warn(`[server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
