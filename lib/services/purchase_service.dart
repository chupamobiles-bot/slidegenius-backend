import 'dart:async';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'usage_service.dart';

class PurchaseService {
  // Must match exactly what you create in Google Play Console
  static const productId = 'officepilot_pro_lifetime';

  static final _iap = InAppPurchase.instance;
  static StreamSubscription<List<PurchaseDetails>>? _sub;

  static Future<void> init() async {
    _sub = _iap.purchaseStream.listen(_onPurchaseUpdate);
  }

  static Future<ProductDetails?> getProduct() async {
    final available = await _iap.isAvailable();
    if (!available) return null;
    final response = await _iap.queryProductDetails({productId});
    if (response.productDetails.isEmpty) return null;
    return response.productDetails.first;
  }

  static Future<String?> getPrice() async {
    final product = await getProduct();
    return product?.price ?? '\$4.99';
  }

  static Future<bool> buyPro() async {
    final product = await getProduct();
    if (product == null) return false;
    final param = PurchaseParam(productDetails: product);
    return _iap.buyNonConsumable(purchaseParam: param);
  }

  static Future<void> restorePurchases() async {
    await _iap.restorePurchases();
  }

  static void _onPurchaseUpdate(List<PurchaseDetails> purchases) {
    for (final p in purchases) {
      if (p.productID == productId) {
        if (p.status == PurchaseStatus.purchased ||
            p.status == PurchaseStatus.restored) {
          UsageService.unlockPro();
        }
        if (p.pendingCompletePurchase) {
          _iap.completePurchase(p);
        }
      }
    }
  }

  static void dispose() => _sub?.cancel();
}
