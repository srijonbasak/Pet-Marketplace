const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// Get all orders for a seller's shop
exports.getOrdersBySeller = async (req, res) => {
  try {
    const { seller } = req.query; // shopId
    if (!seller) return res.status(400).json({ message: 'Missing seller (shopId) parameter' });
    const orders = await Order.find({ shop: seller })
      .populate('buyer', 'firstName lastName email')
      .populate('items.product', 'name');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { shop, items, paymentMethod, total } = req.body;
    const buyer = req.user.id;
    if (!shop || !items || !paymentMethod || !total) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }
    // Deduct stock for each product
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      console.log(`Product ${product.name} stock before:`, product.stock);
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
      console.log(`Product ${product.name} stock after:`, product.stock);
    }
    // Create order
    const order = new Order({ shop, buyer, items, paymentMethod, total });
    console.log('Saving order:', JSON.stringify(order, null, 2));
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 