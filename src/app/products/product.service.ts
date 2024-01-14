import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { Product } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Test error handling with this
  // private productsUrl = 'api/productss';
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(
    undefined,
  );
  productSelected$ = this.productSelectedSubject.asObservable();

  readonly products$: Observable<Product[]> = this.http
    .get<Product[]>(this.productsUrl)
    .pipe(shareReplay(1), catchError(this.handleError));

  readonly product1$: Observable<Product> = this.productSelected$.pipe(
    filter(Boolean),
    switchMap((id) => {
      // Test error handling with this
      // const productUrl = `${this.productsUrl}s/${id}`;
      const productUrl = `${this.productsUrl}/${id}`;

      return this.http.get<Product>(productUrl).pipe(
        switchMap((product) => this.getProductWithReviews(product)),
        catchError(this.handleError),
      );
    }),
  );

  product$ = combineLatest([this.productSelected$, this.products$]).pipe(
    map(([selectedProductId, products]) =>
      products.find((product) => product.id === selectedProductId),
    ),
    filter(Boolean),
    switchMap((product) => this.getProductWithReviews(product)),
    catchError(this.handleError),
  );

  getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(map((reviews) => ({ ...product, reviews }) as Product));
    } else {
      return of(product);
    }
  }

  productSelected(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    // Since we are in pipeline we can simply throw a javascript error
    // throw formattedMessage;
    return throwError(() => formattedMessage);
  }
}
