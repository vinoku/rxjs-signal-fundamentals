import { Component, computed, inject } from '@angular/core';

import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Observable } from 'rxjs';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, AsyncPipe],
})
export class ProductDetailComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // Product to display
  product = this.productService.product;
  errorMessage = this.productService.productError;

  // Set the page title
  pageTitle = computed(() =>
    this.product()
      ? `Product Detail for: ${this.product()?.productName}`
      : 'Product Detail',
  );

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
