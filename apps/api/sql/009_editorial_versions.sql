-- Immutable catalogue snapshots written in the SAME database statement as each edit.
-- Triggers cover normal updates, direct deletes, status batches and CMS edits.
CREATE TABLE IF NOT EXISTS editorial_versions (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 target_type ENUM('series','season','episode','banner') NOT NULL,
 target_id VARCHAR(36) NOT NULL,
 series_id VARCHAR(36) NULL,
 operation ENUM('baseline','created','updated','deleted') NOT NULL,
 snapshot JSON NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 INDEX idx_version_target(target_type,target_id,id),
 INDEX idx_version_series(series_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS editorial_reviews (
 id CHAR(36) PRIMARY KEY,
 target_type ENUM('series','season','episode','banner') NOT NULL,
 target_id VARCHAR(36) NOT NULL,
 version_id BIGINT UNSIGNED NOT NULL,
 submitted_by CHAR(36) NOT NULL,
 reviewed_by CHAR(36) NULL,
 state ENUM('pending','approved','rejected','stale') NOT NULL DEFAULT 'pending',
 message VARCHAR(1000) NOT NULL DEFAULT '',
 decision_note VARCHAR(1000) NOT NULL DEFAULT '',
 submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 reviewed_at DATETIME(3) NULL,
 INDEX idx_review_target(target_type,target_id,submitted_at),
 INDEX idx_review_status(state,submitted_at),
 FOREIGN KEY(version_id) REFERENCES editorial_versions(id),
 FOREIGN KEY(submitted_by) REFERENCES users(id),
 FOREIGN KEY(reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TRIGGER editorial_series_created AFTER INSERT ON series
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('series',NEW.id,NEW.id,'created',JSON_OBJECT('title',NEW.title,'slug',NEW.slug,'category',NEW.category,'summary',NEW.summary,'poster',NEW.poster,'banner',NEW.banner,'featured',NEW.featured,'visibility',NEW.visibility));

CREATE TRIGGER editorial_series_updated AFTER UPDATE ON series
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('series',NEW.id,NEW.id,'updated',JSON_OBJECT('title',NEW.title,'slug',NEW.slug,'category',NEW.category,'summary',NEW.summary,'poster',NEW.poster,'banner',NEW.banner,'featured',NEW.featured,'visibility',NEW.visibility));

CREATE TRIGGER editorial_series_deleted AFTER DELETE ON series
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('series',OLD.id,OLD.id,'deleted',JSON_OBJECT('title',OLD.title,'slug',OLD.slug,'category',OLD.category,'summary',OLD.summary,'poster',OLD.poster,'banner',OLD.banner,'featured',OLD.featured,'visibility',OLD.visibility));

INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 SELECT 'series',x.id,x.id,'baseline',JSON_OBJECT('title',x.title,'slug',x.slug,'category',x.category,'summary',x.summary,'poster',x.poster,'banner',x.banner,'featured',x.featured,'visibility',x.visibility) FROM series x;

CREATE TRIGGER editorial_season_created AFTER INSERT ON seasons
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('season',NEW.id,NEW.series_id,'created',JSON_OBJECT('title',NEW.title,'number',NEW.number,'seriesId',NEW.series_id,'status',NEW.status));

CREATE TRIGGER editorial_season_updated AFTER UPDATE ON seasons
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('season',NEW.id,NEW.series_id,'updated',JSON_OBJECT('title',NEW.title,'number',NEW.number,'seriesId',NEW.series_id,'status',NEW.status));

CREATE TRIGGER editorial_season_deleted AFTER DELETE ON seasons
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('season',OLD.id,OLD.series_id,'deleted',JSON_OBJECT('title',OLD.title,'number',OLD.number,'seriesId',OLD.series_id,'status',OLD.status));

INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 SELECT 'season',x.id,x.series_id,'baseline',JSON_OBJECT('title',x.title,'number',x.number,'seriesId',x.series_id,'status',x.status) FROM seasons x;

CREATE TRIGGER editorial_episode_created AFTER INSERT ON episodes
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('episode',NEW.id,(SELECT series_id FROM seasons WHERE id=NEW.season_id),'created',JSON_OBJECT('seasonId',NEW.season_id,'number',NEW.number,'title',NEW.title,'summary',NEW.summary,'youtubeId',NEW.youtube_id,'thumbnail',NEW.thumbnail,'releaseAt',NEW.release_at,'endAt',NEW.end_at,'status',NEW.status,'duration',NEW.duration));

CREATE TRIGGER editorial_episode_updated AFTER UPDATE ON episodes
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('episode',NEW.id,(SELECT series_id FROM seasons WHERE id=NEW.season_id),'updated',JSON_OBJECT('seasonId',NEW.season_id,'number',NEW.number,'title',NEW.title,'summary',NEW.summary,'youtubeId',NEW.youtube_id,'thumbnail',NEW.thumbnail,'releaseAt',NEW.release_at,'endAt',NEW.end_at,'status',NEW.status,'duration',NEW.duration));

CREATE TRIGGER editorial_episode_deleted AFTER DELETE ON episodes
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('episode',OLD.id,(SELECT series_id FROM seasons WHERE id=OLD.season_id),'deleted',JSON_OBJECT('seasonId',OLD.season_id,'number',OLD.number,'title',OLD.title,'summary',OLD.summary,'youtubeId',OLD.youtube_id,'thumbnail',OLD.thumbnail,'releaseAt',OLD.release_at,'endAt',OLD.end_at,'status',OLD.status,'duration',OLD.duration));

INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 SELECT 'episode',x.id,(SELECT series_id FROM seasons WHERE id=x.season_id),'baseline',JSON_OBJECT('seasonId',x.season_id,'number',x.number,'title',x.title,'summary',x.summary,'youtubeId',x.youtube_id,'thumbnail',x.thumbnail,'releaseAt',x.release_at,'endAt',x.end_at,'status',x.status,'duration',x.duration) FROM episodes x;

CREATE TRIGGER editorial_banner_created AFTER INSERT ON banners
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('banner',NEW.id,NEW.target_series_id,'created',JSON_OBJECT('title',NEW.title,'subtitle',NEW.subtitle,'image',NEW.image,'mobileImage',NEW.mobile_image,'target',NEW.target_series_id,'startAt',NEW.start_at,'endAt',NEW.end_at,'active',NEW.active,'order',NEW.display_order));

CREATE TRIGGER editorial_banner_updated AFTER UPDATE ON banners
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('banner',NEW.id,NEW.target_series_id,'updated',JSON_OBJECT('title',NEW.title,'subtitle',NEW.subtitle,'image',NEW.image,'mobileImage',NEW.mobile_image,'target',NEW.target_series_id,'startAt',NEW.start_at,'endAt',NEW.end_at,'active',NEW.active,'order',NEW.display_order));

CREATE TRIGGER editorial_banner_deleted AFTER DELETE ON banners
 FOR EACH ROW INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 VALUES('banner',OLD.id,OLD.target_series_id,'deleted',JSON_OBJECT('title',OLD.title,'subtitle',OLD.subtitle,'image',OLD.image,'mobileImage',OLD.mobile_image,'target',OLD.target_series_id,'startAt',OLD.start_at,'endAt',OLD.end_at,'active',OLD.active,'order',OLD.display_order));

INSERT INTO editorial_versions(target_type,target_id,series_id,operation,snapshot)
 SELECT 'banner',x.id,x.target_series_id,'baseline',JSON_OBJECT('title',x.title,'subtitle',x.subtitle,'image',x.image,'mobileImage',x.mobile_image,'target',x.target_series_id,'startAt',x.start_at,'endAt',x.end_at,'active',x.active,'order',x.display_order) FROM banners x;
