import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
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
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import { Result } from '../utilities/result';

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

  selectedProductId = signal<number | undefined>(undefined);

  readonly productsResult$: Observable<Result<Product[]>> = this.http
    .get<Product[]>(this.productsUrl)
    .pipe(
      map((p) => ({ data: p, error: undefined }) as Result<Product[]>),
      shareReplay(1),
      catchError((err) =>
        of({ data: [], error: this.errorService.formatError(err) } as Result<
          Product[]
        >),
      ),
    );

  private productsResult = toSignal(this.productsResult$, {
    initialValue: { data: [], error: undefined } as Result<Product[]>,
  });
  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);
  // products = computed(() => {
  //   try {
  //     return toSignal(this.products$, { initialValue: [] as Product[]});
  //   } catch (error) {
  //     return [] as Product[];
  //   }
  // });

  private productResult$: Observable<Result<Product>> = toObservable(this.selectedProductId).pipe(
    filter(Boolean),
    switchMap((id) => {
      // Test error handling with this
      // const productUrl = `${this.productsUrl}s/${id}`;
      const productUrl = `${this.productsUrl}/${id}`;

      return this.http.get<Product>(productUrl).pipe(
        switchMap((product) => this.getProductWithReviews(product)),
        catchError(err => of({data: undefined, error: this.errorService.formatError(err)} as Result<Product>)),
      );
    }),
    map(p => ({ data: p} as Result<Product>))
  );
  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productError = computed(() => this.productResult()?.error);

  // product1$ = combineLatest([this.productSelected$, this.products$]).pipe(
  //   map(([selectedProductId, products]) =>
  //     products.find((product) => product.id === selectedProductId),
  //   ),
  //   filter(Boolean),
  //   switchMap((product) => this.getProductWithReviews(product)),
  //   catchError(this.handleError),
  // );

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
    this.selectedProductId.set(selectedProductId);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    // Since we are in pipeline we can simply throw a javascript error
    // throw formattedMessage;
    return throwError(() => formattedMessage);
  }
}
