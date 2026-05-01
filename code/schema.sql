/*--
-- PostgreSQL database dump
--

\restrict z5lNYWY9oSneemmm7e66nd3quHV33HDX4F9DhLQfj2o51NDhILTaaUYqP3BZbqP

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: canceled_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canceled_reservations (
    cancel_id integer NOT NULL,
    reservation_id integer NOT NULL,
    canceled_by integer,
    reason text,
    canceled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.canceled_reservations OWNER TO postgres;

--
-- Name: canceled_reservations_cancel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.canceled_reservations_cancel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.canceled_reservations_cancel_id_seq OWNER TO postgres;

--
-- Name: canceled_reservations_cancel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.canceled_reservations_cancel_id_seq OWNED BY public.canceled_reservations.cancel_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: override_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.override_requests (
    request_id integer NOT NULL,
    reservation_id integer NOT NULL,
    lecturer_id integer NOT NULL,
    student_id integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT override_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.override_requests OWNER TO postgres;

--
-- Name: override_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.override_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.override_requests_request_id_seq OWNER TO postgres;

--
-- Name: override_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.override_requests_request_id_seq OWNED BY public.override_requests.request_id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    reservation_id integer NOT NULL,
    user_id integer NOT NULL,
    room_id integer NOT NULL,
    reservation_date date NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reservations_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservations_reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservations_reservation_id_seq OWNER TO postgres;

--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservations_reservation_id_seq OWNED BY public.reservations.reservation_id;


--
-- Name: room_waitlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_waitlist (
    waitlist_id integer NOT NULL,
    user_id integer NOT NULL,
    room_id integer NOT NULL,
    reservation_date date NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    queue_position integer NOT NULL,
    status character varying(20) DEFAULT 'waiting'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT room_waitlist_status_check CHECK (((status)::text = ANY ((ARRAY['waiting'::character varying, 'notified'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.room_waitlist OWNER TO postgres;

--
-- Name: room_waitlist_waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_waitlist_waitlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_waitlist_waitlist_id_seq OWNER TO postgres;

--
-- Name: room_waitlist_waitlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_waitlist_waitlist_id_seq OWNED BY public.room_waitlist.waitlist_id;


--
-- Name: room_watchlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_watchlist (
    watch_id integer NOT NULL,
    user_id integer NOT NULL,
    room_id integer NOT NULL,
    reservation_date date NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.room_watchlist OWNER TO postgres;

--
-- Name: room_watchlist_watch_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_watchlist_watch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_watchlist_watch_id_seq OWNER TO postgres;

--
-- Name: room_watchlist_watch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_watchlist_watch_id_seq OWNED BY public.room_watchlist.watch_id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_id integer NOT NULL,
    room_name character varying(100) NOT NULL,
    capacity integer NOT NULL,
    location character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rooms_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rooms_room_id_seq OWNER TO postgres;

--
-- Name: rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rooms_room_id_seq OWNED BY public.rooms.room_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    verification_token text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'staff'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: canceled_reservations cancel_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canceled_reservations ALTER COLUMN cancel_id SET DEFAULT nextval('public.canceled_reservations_cancel_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: override_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.override_requests ALTER COLUMN request_id SET DEFAULT nextval('public.override_requests_request_id_seq'::regclass);


--
-- Name: reservations reservation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations ALTER COLUMN reservation_id SET DEFAULT nextval('public.reservations_reservation_id_seq'::regclass);


--
-- Name: room_waitlist waitlist_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_waitlist ALTER COLUMN waitlist_id SET DEFAULT nextval('public.room_waitlist_waitlist_id_seq'::regclass);


--
-- Name: room_watchlist watch_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_watchlist ALTER COLUMN watch_id SET DEFAULT nextval('public.room_watchlist_watch_id_seq'::regclass);


--
-- Name: rooms room_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms ALTER COLUMN room_id SET DEFAULT nextval('public.rooms_room_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: canceled_reservations canceled_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canceled_reservations
    ADD CONSTRAINT canceled_reservations_pkey PRIMARY KEY (cancel_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: override_requests override_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.override_requests
    ADD CONSTRAINT override_requests_pkey PRIMARY KEY (request_id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: room_waitlist room_waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_waitlist
    ADD CONSTRAINT room_waitlist_pkey PRIMARY KEY (waitlist_id);


--
-- Name: room_watchlist room_watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_watchlist
    ADD CONSTRAINT room_watchlist_pkey PRIMARY KEY (watch_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_waitlist_room_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_waitlist_room_slot ON public.room_waitlist USING btree (room_id, reservation_date, start_time, end_time);


--
-- Name: canceled_reservations canceled_reservations_canceled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canceled_reservations
    ADD CONSTRAINT canceled_reservations_canceled_by_fkey FOREIGN KEY (canceled_by) REFERENCES public.users(user_id);


--
-- Name: canceled_reservations canceled_reservations_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canceled_reservations
    ADD CONSTRAINT canceled_reservations_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(reservation_id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: override_requests override_requests_lecturer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.override_requests
    ADD CONSTRAINT override_requests_lecturer_id_fkey FOREIGN KEY (lecturer_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: override_requests override_requests_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.override_requests
    ADD CONSTRAINT override_requests_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(reservation_id) ON DELETE CASCADE;


--
-- Name: override_requests override_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.override_requests
    ADD CONSTRAINT override_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: reservations reservations_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: reservations reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: room_waitlist room_waitlist_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_waitlist
    ADD CONSTRAINT room_waitlist_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: room_waitlist room_waitlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_waitlist
    ADD CONSTRAINT room_waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: room_watchlist room_watchlist_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_watchlist
    ADD CONSTRAINT room_watchlist_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: room_watchlist room_watchlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_watchlist
    ADD CONSTRAINT room_watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict z5lNYWY9oSneemmm7e66nd3quHV33HDX4F9DhLQfj2o51NDhILTaaUYqP3BZbqP*/

-- =====================================================
-- ChronoCampus Database Setup
-- PostgreSQL
-- Run this in pgAdmin4 Query Tool on chronocampus_db
-- =====================================================

-- Drop all tables (safe reset for development)
DROP TABLE IF EXISTS canceled_reservations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS room_waitlist CASCADE;
DROP TABLE IF EXISTS room_watchlist CASCADE;
DROP TABLE IF EXISTS override_requests CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─────────────────────────────────────────
-- USERS TABLE
-- Owned by Member 1 (auth/login module)
-- Includes department column from their schema
-- ─────────────────────────────────────────
CREATE TABLE users (
    user_id            SERIAL PRIMARY KEY,
    full_name          VARCHAR(100) NOT NULL,
    email              VARCHAR(150) UNIQUE NOT NULL,
    password_hash      TEXT NOT NULL,
    role               VARCHAR(20) NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
    department         VARCHAR(100) NOT NULL,
    is_active          BOOLEAN DEFAULT TRUE,
    email_verified     BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Only seed the admin user — students and staff register via signup page
-- Password '123' is plain text for development; member 1 will handle hashing in production


-- ─────────────────────────────────────────
-- ROOMS TABLE
-- ─────────────────────────────────────────
CREATE TABLE rooms (
    room_id    SERIAL PRIMARY KEY,
    room_name  VARCHAR(100) NOT NULL,
    capacity   INTEGER NOT NULL,
    location   VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────
-- RESERVATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE reservations (
    reservation_id   SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    room_id          INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP NOT NULL,
    status           VARCHAR(20) DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- OVERRIDE REQUESTS TABLE
-- ─────────────────────────────────────────
CREATE TABLE override_requests (
    request_id     SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    lecturer_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    student_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status         VARCHAR(20) DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- ROOM WATCHLIST TABLE
-- ─────────────────────────────────────────
CREATE TABLE room_watchlist (
    watch_id         SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    room_id          INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- NOTIFICATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- CANCELED RESERVATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE canceled_reservations (
    cancel_id      SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    canceled_by    INTEGER REFERENCES users(user_id),
    reason         TEXT,
    canceled_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- ROOM WAITLIST (QUEUE) TABLE
-- ─────────────────────────────────────────
CREATE TABLE room_waitlist (
    waitlist_id      SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    room_id          INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP NOT NULL,
    queue_position   INTEGER NOT NULL,
    status           VARCHAR(20) DEFAULT 'waiting'
                     CHECK (status IN ('waiting', 'notified', 'expired')),
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_waitlist_room_slot
    ON room_waitlist (room_id, reservation_date, start_time, end_time);

-- =====================================================
-- DONE — Login as admin@test.com / 123 to get started
-- Students and staff register via the signup page
-- =====================================================

