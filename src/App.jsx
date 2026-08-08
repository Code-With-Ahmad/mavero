import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import About from "./pages/legal/About";
import Contact from "./pages/legal/Contact";
import Faq from "./pages/legal/Faq";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Terms from "./pages/legal/Terms";
import ShippingPolicy from "./pages/legal/ShippingPolicy";
import ReturnPolicy from "./pages/legal/ReturnPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import PageSpinner from "./components/common/PageSpinner";
import ScrollToTop from "./components/common/ScrollToTop";

// Admin panel (charts, forms, tables) is only ever loaded by admins — keep
// it out of the storefront's initial bundle.
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:sku" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<Terms />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Suspense fallback={<PageSpinner />}>
              <AdminLayout />
            </Suspense>
          </AdminRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageSpinner />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AdminProducts />
            </Suspense>
          }
        />
        <Route
          path="products/new"
          element={
            <Suspense fallback={<PageSpinner />}>
              <ProductForm />
            </Suspense>
          }
        />
        <Route
          path="products/:sku"
          element={
            <Suspense fallback={<PageSpinner />}>
              <ProductForm />
            </Suspense>
          }
        />
        <Route
          path="categories"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AdminCategories />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AdminOrders />
            </Suspense>
          }
        />
        <Route
          path="orders/:orderId"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AdminOrderDetail />
            </Suspense>
          }
        />
        <Route
          path="customers"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AdminCustomers />
            </Suspense>
          }
        />
        <Route
          path="coupons"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AdminCoupons />
            </Suspense>
          }
        />
        <Route
          path="reviews"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AdminReviews />
            </Suspense>
          }
        />
      </Route>
      </Routes>
    </>
  );
}

export default App;
