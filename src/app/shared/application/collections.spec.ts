import {BaseEntity} from '../domain/model/base-entity';
import {byNewest, replaceManyById, upsertById} from './collections';

interface Item extends BaseEntity {
  name: string;
}

const item = (id: number, name: string): Item => ({ id, name });

describe('collections', () => {
  describe('upsertById', () => {
    it('replaces the entity that has the same id and keeps the order', () => {
      const result = upsertById([item(1, 'a'), item(2, 'b'), item(3, 'c')], item(2, 'B'));
      expect(result).toEqual([item(1, 'a'), item(2, 'B'), item(3, 'c')]);
    });

    it('appends an entity that is not in the collection', () => {
      expect(upsertById([item(1, 'a')], item(2, 'b'))).toEqual([item(1, 'a'), item(2, 'b')]);
    });

    it('does not change the original collection', () => {
      const original = [item(1, 'a')];
      upsertById(original, item(1, 'A'));
      expect(original).toEqual([item(1, 'a')]);
    });
  });

  describe('replaceManyById', () => {
    it('updates the entities that exist and appends the new ones', () => {
      const result = replaceManyById([item(1, 'a'), item(2, 'b')], [item(2, 'B'), item(3, 'c')]);
      expect(result).toEqual([item(1, 'a'), item(2, 'B'), item(3, 'c')]);
    });

    it('returns the same entities when there is nothing to replace', () => {
      expect(replaceManyById([item(1, 'a')], [])).toEqual([item(1, 'a')]);
    });
  });

  describe('byNewest', () => {
    it('sorts the most recent date first', () => {
      const dated = [{ at: '2026-11-10' }, { at: '2026-11-12' }, { at: '2026-11-11' }];
      expect(dated.sort(byNewest(entry => entry.at)).map(entry => entry.at)).toEqual(['2026-11-12', '2026-11-11', '2026-11-10']);
    });

    it('puts the entries without date last', () => {
      const dated: { at: string | null }[] = [{ at: null }, { at: '2026-11-10' }];
      expect(dated.sort(byNewest(entry => entry.at)).map(entry => entry.at)).toEqual(['2026-11-10', null]);
    });
  });
});
