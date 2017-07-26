const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Product = require('./models/product');
const WishList = require('./models/wishlist');

const app = express();


mongoose.connect('mongodb://localhost/shop-tut', {
  useMongoClient: true
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/product', (req, res) => {
  Product.find({}, (err, products) => {
    if (err) {
      res.status(500).send({error: 'Could not fetch products'});
    } else {
      res.send(products);
    }
  })
})

app.post('/product', (req, res) => {
  let product = new Product();
  product.title = req.body.title;
  product.price = req.body.price;
  product.save((err, savedProduct) => {
    if (err) {
      res.status(500).send({error: 'Could not save product'});
    } else {
      res.send(savedProduct);
    }
  })
});

app.get('/product/:productId', (req, res) => {
  Product.findById(req.params.productId, (err, product) =>{
    if (err) {
      res.status(500).send({error: 'Could not find this product'})
    } else {
      res.send(product)
    }
  })
})

app.put('/product/:productId', (req, res) => {
  const updates = {
    price: req.body.price,
    title: req.body.title
  }

  Product.findByIdAndUpdate(req.params.productId, updates, (err, product) => {
    if (err) {
      res.status(500).send({error: 'Could not find this product'});
    }
  })
})

app.delete('/product/delete/:productId', (req, res) => {
  Product.findOneAndRemove(req.params.productId, (err) => {
    if (err) {
      res.status(500).send({error: 'The product could not be deleted'});
    } else {
      res.send('The product has been deleted');
    }
  });
});

app.get('/wishlist', (req, res) => {
  WishList.find({}).populate({path: 'products', model: 'Product'}).exec((err, wishLists) => {
      if (err) {
        res.status(500).send({error: 'Could not fetch wishlists'});
      } else {
        res.status(200).send(wishLists);
      }
    })
});

app.post('/wishlist', (req, res) => {
  let wishList = new WishList();
  wishList.title = req.body.title;
  wishList.save((err, newWishList) => {
    if (err) {
      res.status(500).send({error: 'Could not create wishlist'});
    } else {
      res.send(newWishList);
    }
  });
});


app.put('/wishlist/product/add', (req, res) => {
  Product.findOne({_id: req.body.productId}, (err, product) => {
    if (err) {
      res.status(500).send({error: 'Could not add item to wishlist'});
    } else {
      WishList.update({_id: req.body.wishListId}, {$addToSet:
      {products: product._id}}, (err, wishList) => {
        if (err) {
          res.status(500).send({error: 'Could not add item to wishlist'});
        } else {
          res.send(wishList);
        }
      });
    }
  })
})


app.listen(3000, () => {
  console.log("listening on port 3000");
});
