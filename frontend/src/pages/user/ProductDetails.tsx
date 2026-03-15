import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon, BoltIcon, CheckBadgeIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(productId);
      if (response.data.success) {
        setProduct(response.data.data.product);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAddingToCart(true);
      const quantityToAdd = product.minOrderQuantity || 1;
      await addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantityToAdd,
        minOrderQuantity: quantityToAdd,
        stock: product.stock,
        brand: product.brand,
        total: product.price * quantityToAdd
      });
      // Added Toast ideally, but minimal feedback here
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id) return;
    try {
      setSubmittingReview(true);
      await productAPI.addReview(id, { rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      fetchProductDetails(id); // refresh to show new review
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const hasImages = images.length > 0;
  
  // Dummy reviews if none exist
  const reviews = product.reviews?.length > 0 ? product.reviews : [];
  const rating = product.rating || 4.5;
  const numReviews = product.numReviews || 0;

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex text-sm font-medium text-gray-500 py-4 mb-4">
        <span onClick={() => navigate('/')} className="hover:text-primary-600 cursor-pointer">Home</span>
        <span className="mx-2">&rsaquo;</span>
        <span onClick={() => navigate('/products')} className="hover:text-primary-600 cursor-pointer">Wholesale Catalog</span>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Column: Images */}
          <div className="w-full lg:w-2/5 p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="sticky top-24">
              <div className="aspect-square w-full bg-gray-50 rounded-2xl flex items-center justify-center p-6 mb-4 border border-gray-100 relative group mix-blend-multiply">
                {hasImages ? (
                  <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain hover:scale-110 transition-transform duration-500 cursor-crosshair" />
                ) : (
                  <span className="text-gray-300 font-black text-6xl tracking-tighter">KT</span>
                )}
                
                {product.stock <= 0 && (
                  <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    Out of Stock
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {hasImages && images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 CustomScrollbar">
                  {images.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 p-1 overflow-hidden transition-all ${activeImage === idx ? 'border-primary-500 shadow-md ring-2 ring-primary-100 ring-offset-1' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain bg-gray-50 rounded-lg" />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addingToCart}
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 border-none font-bold text-white shadow-xl shadow-amber-500/30 rounded-xl"
                >
                  {addingToCart ? <LoadingSpinner size="sm" /> : <><ShoppingCartIcon className="w-5 h-5 mr-2" /> Add to Cart</>}
                </Button>
                <Button 
                  onClick={() => {
                    handleAddToCart().then(() => navigate('/cart'));
                  }}
                  disabled={product.stock <= 0}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 border-none font-bold text-white shadow-xl shadow-orange-600/30 rounded-xl"
                >
                  <BoltIcon className="w-5 h-5 mr-2" /> Buy Now
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full lg:w-3/5 p-6 sm:p-10">
            {/* Title & Brand */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-widest rounded-md">
                {product.brand}
              </span>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-green-600 text-white px-2 py-0.5 rounded flex items-center font-bold">
                  {rating} <StarIcon className="w-3 h-3 ml-1" />
                </span>
                <span className="text-gray-500 font-medium hover:text-primary-600 cursor-pointer">{numReviews} Ratings & Reviews</span>
              </div>
            </div>

            {/* Price section */}
            <div className="my-6 space-y-2 pb-6 border-b border-gray-100">
              <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-gray-900 tracking-tight">₹{product.price.toFixed(2)}</span>
                {/* Simulated MRP */}
                <span className="text-lg text-gray-400 line-through font-medium mb-1">₹{(product.price * 1.2).toFixed(2)}</span>
                <span className="text-green-600 font-bold text-lg mb-1">16% off</span>
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Wholesale Price (Tax Incl.)</p>
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase">Available Offers</h3>
              <ul className="space-y-3">
                <li className="flex items-start text-sm"><CheckBadgeIcon className="w-5 h-5 text-green-500 shrink-0 mr-2 mt-0.5" /><span className="text-gray-700"><span className="font-bold">Bank Offer:</span> 5% Unlimited Cashback on Axis Bank Credit Card</span></li>
                <li className="flex items-start text-sm"><CheckBadgeIcon className="w-5 h-5 text-green-500 shrink-0 mr-2 mt-0.5" /><span className="text-gray-700"><span className="font-bold">Partner Offer:</span> Sign up for Krishna Pay Later and get free rewards worth ₹500</span></li>
              </ul>
            </div>

            <div className="flex items-center gap-8 mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-8 h-8 text-primary-600" />
                <span className="font-bold text-gray-700 text-sm">Fast<br/>Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-8 h-8 text-primary-600" />
                <span className="font-bold text-gray-700 text-sm">Assured<br/>Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
                <span className="font-bold text-gray-700 text-sm">Wholesale Price<br/>Guaranteed</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.description || 'No detailed description available for this product. Premium quality guaranteed by Krishna Trades.'}
              </p>
            </div>

            {/* Details Table */}
            <div className="mb-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center text-sm">
                  <span className="w-1/3 text-gray-500 font-semibold">SKU</span>
                  <span className="w-2/3 text-gray-900 font-medium">{product.sku}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-1/3 text-gray-500 font-semibold">Brand</span>
                  <span className="w-2/3 text-gray-900 font-medium">{product.brand}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-1/3 text-gray-500 font-semibold">Stock Status</span>
                  <span className={`w-2/3 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </div>
                {product.specifications?.weight && (
                  <div className="flex items-center text-sm">
                    <span className="w-1/3 text-gray-500 font-semibold">Weight</span>
                    <span className="w-2/3 text-gray-900 font-medium">{product.specifications.weight} kg</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h2>
          <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline" className="border-gray-200 shadow-sm font-bold text-sm">
            {showReviewForm ? 'Cancel' : 'Rate Product'}
          </Button>
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    {star <= reviewRating ? (
                      <StarIcon className="w-8 h-8 text-yellow-400 drop-shadow-sm" />
                    ) : (
                      <StarOutlineIcon className="w-8 h-8 text-gray-300 hover:text-yellow-300 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Review Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Share your experience with this product..."
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={submittingReview} disabled={!reviewComment.trim()} className="px-8 py-3 rounded-xl font-bold shadow-md">
                Submit Review
              </Button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 text-sm">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: any, idx: number) => (
              <div key={idx} className="border-b border-gray-50 pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-green-600 flex items-center text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {review.rating} <StarIcon className="w-3 h-3 ml-0.5" />
                  </span>
                  <span className="text-sm font-bold text-gray-900">{review.comment}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 font-medium">
                  <span>{review.userName || 'Verified Buyer'}</span>
                  <span>•</span>
                  <span>{new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 ml-4 text-gray-400 hover:text-primary-600 cursor-pointer transition-colors">
                    <CheckBadgeIcon className="w-4 h-4"/> Verified Purchase
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
