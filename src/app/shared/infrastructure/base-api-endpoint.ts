import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseEntity, EntityId} from '../domain/model/base-entity';
import {BaseResource} from './base-response';
import {BaseAssembler} from './base-assembler';
import {ErrorHandlingEnabledBaseType} from './error-handling-enabled-base-type';
import {QueryParams} from './base-api';

/** CRUD endpoint of one REST collection. The assembler turns resources into domain entities and back. */
export class BaseApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TAssembler extends BaseAssembler<TEntity, TResource>
> extends ErrorHandlingEnabledBaseType {
  constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler
  ) {
    super();
  }

  getAll(filters: QueryParams = {}): Observable<TEntity[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return this.http.get<TResource[]>(this.endpointUrl, { params }).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch entities'))
    );
  }

  getById(id: EntityId): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to fetch entity'))
    );
  }

  create(entity: TEntity): Observable<TEntity> {
    return this.http.post<TResource>(this.endpointUrl, this.assembler.toResourceFromEntity(entity)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create entity'))
    );
  }

  update(entity: TEntity, id: EntityId): Observable<TEntity> {
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, this.assembler.toResourceFromEntity(entity)).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update entity'))
    );
  }

  delete(id: EntityId): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`).pipe(
      catchError(this.handleError('Failed to delete entity'))
    );
  }
}
