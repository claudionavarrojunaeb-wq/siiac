SELECT id,
       checksum,
       finished_at,
       migration_name,
       logs,
       rolled_back_at,
       started_at,
       applied_steps_count
FROM public._prisma_migrations
LIMIT 1000;