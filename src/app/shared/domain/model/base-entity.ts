/** Public identifier of an entity: UUIDs for aggregates, numbers for some child entities. */
export type EntityId = string | number;

export interface BaseEntity {
  id: EntityId;
}
