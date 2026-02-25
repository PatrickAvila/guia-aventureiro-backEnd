// backend/src/controllers/checkoutController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

/**
 * Criar Stripe Checkout Session para upgrade Premium
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se já é premium
    if (user.subscription?.plan === 'premium' && user.subscription?.status === 'active') {
      return res.status(400).json({ 
        error: 'Você já possui um plano Premium ativo',
        subscription: user.subscription 
      });
    }

    // Criar ou recuperar Stripe Customer
    let customerId = user.subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      
      // Salvar customer ID
      user.subscription = user.subscription || {};
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // price_1T4SMCRunOGW68vfag3Usrwl
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_SCHEME || 'guiaaventureiro'}://checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_SCHEME || 'guiaaventureiro'}://checkout/cancel`,
      metadata: {
        userId: user._id.toString()
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString()
        }
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Erro ao criar checkout session:', error);
    res.status(500).json({ 
      error: 'Erro ao criar sessão de pagamento',
      details: error.message 
    });
  }
};

/**
 * Verificar status de uma Checkout Session
 */
exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      subscription: session.subscription,
      customer: session.customer
    });

  } catch (error) {
    console.error('Erro ao verificar checkout session:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar sessão',
      details: error.message 
    });
  }
};
