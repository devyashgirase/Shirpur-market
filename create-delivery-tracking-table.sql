-- Create delivery tracking table for real-time agent location tracking
create table public.delivery_tracking (
  id serial not null,
  agent_id character varying(50) not null,
  order_id character varying(50) null,
  latitude decimal(10,8) not null,
  longitude decimal(11,8) not null,
  accuracy decimal(10,2) null,
  timestamp timestamp with time zone not null default now(),
  status character varying(50) null default 'active',
  constraint delivery_tracking_pkey primary key (id)
) TABLESPACE pg_default;

-- Create index for faster queries
create index IF not exists idx_delivery_tracking_agent_id on public.delivery_tracking using btree (agent_id) TABLESPACE pg_default;
create index IF not exists idx_delivery_tracking_timestamp on public.delivery_tracking using btree (timestamp) TABLESPACE pg_default;