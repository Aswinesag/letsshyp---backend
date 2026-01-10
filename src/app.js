const express = require('express');

const orderRoutes = require('./routes/orders.routes');
const courierRoutes = require('./routes/couriers.routes');

const app = express();
app.use(espress.json());

app.use('/orders', orderRoutes);
app.use('/couriers', courierRoutes);

module.exports = app;