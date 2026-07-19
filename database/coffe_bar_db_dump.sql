--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5
-- Dumped by pg_dump version 14.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: process_order_item_totals(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_order_item_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

DECLARE

    v_base_price NUMERIC(12, 2);

    v_extra_price NUMERIC(12, 2) := 0;

BEGIN

    -- Извлекаем базовую цену товара

    SELECT price INTO v_base_price 

    FROM products 

    WHERE id = NEW.product_id;



    IF v_base_price IS NULL THEN

        RAISE EXCEPTION 'Товар с id % не найден.', NEW.product_id;

    END IF;



    -- Разбираем JSONB кастомизаций и считаем наценки на уровне БД

    -- 1. Наценка за объем

    IF NEW.customizations->>'volume' = '0.3' THEN

        v_extra_price := v_extra_price + 40;

    ELSIF NEW.customizations->>'volume' = '0.4' THEN

        v_extra_price := v_extra_price + 80;

    END IF;



    -- 2. Наценка за альтернативное молоко

    IF NEW.customizations->>'milk' IN ('кокосовое', 'соевое') THEN

        v_extra_price := v_extra_price + 50;

    END IF;



    -- 3. Наценка за количество сиропов (считаем длину массива в JSONB)

    IF NEW.customizations->'syrup' IS NOT NULL THEN

        v_extra_price := v_extra_price + (jsonb_array_length(NEW.customizations->'syrup') * 30);

    END IF;



    -- Записываем финальную цену за единицу товара с учетом кастомизации

    NEW.price := v_base_price + v_extra_price;



    RETURN NEW;

END;

$$;


ALTER FUNCTION public.process_order_item_totals() OWNER TO postgres;

--
-- Name: update_order_total_price(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_order_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$


DECLARE


    v_order_id INTEGER;


BEGIN


    -- Определяем ID заказа в зависимости от операции (учитываем DELETE)


    IF TG_OP = 'DELETE' THEN


        v_order_id := OLD.order_id;


    ELSE


        v_order_id := NEW.order_id;


    END IF;


    -- Пересчитываем сумму всех позиций и обновляем заголовок заказа


    UPDATE orders


    SET total_price = COALESCE((


        SELECT SUM(quantity * price) 


        FROM order_items 


        WHERE order_id = v_order_id


    ), 0)


    WHERE id = v_order_id;


    RETURN NULL; -- Для AFTER-триггеров возвращаемое значение не имеет значения


END;


$$;


ALTER FUNCTION public.update_order_total_price() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    CONSTRAINT chk_categories_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(12,2) NOT NULL,
    customizations jsonb,
    CONSTRAINT chk_order_items_price CHECK ((price >= (0)::numeric)),
    CONSTRAINT chk_order_items_quantity CHECK ((quantity > 0))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status_id integer NOT NULL,
    total_price numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    pickup_time timestamp with time zone,
    CONSTRAINT chk_orders_total_price CHECK ((total_price >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    price numeric(12,2) NOT NULL,
    image_url character varying(2048),
    is_available boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_products_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0)),
    CONSTRAINT chk_products_price CHECK ((price > (0)::numeric))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    title character varying(50) NOT NULL,
    CONSTRAINT chk_roles_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statuses (
    id integer NOT NULL,
    title character varying(50) NOT NULL,
    CONSTRAINT chk_statuses_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


ALTER TABLE public.statuses OWNER TO postgres;

--
-- Name: statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.statuses_id_seq OWNER TO postgres;

--
-- Name: statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.statuses_id_seq OWNED BY public.statuses.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    last_name character varying(50) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(30),
    CONSTRAINT chk_profiles_email_not_empty CHECK ((length(TRIM(BOTH FROM email)) > 0)),
    CONSTRAINT chk_profiles_first_name_not_empty CHECK ((length(TRIM(BOTH FROM first_name)) > 0)),
    CONSTRAINT chk_profiles_last_name_not_empty CHECK ((length(TRIM(BOTH FROM last_name)) > 0)),
    CONSTRAINT chk_profiles_phone_not_empty CHECK (((phone IS NULL) OR (length(TRIM(BOTH FROM phone)) > 0)))
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    password_hash character(60) NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statuses ALTER COLUMN id SET DEFAULT nextval('public.statuses_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, title) FROM stdin;
1	Кофе
2	Чай
3	Выпечка
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price, customizations) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, status_id, total_price, created_at, pickup_time) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, category_id, name, description, price, image_url, is_available) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, title) FROM stdin;
1	client
2	admin
\.


--
-- Data for Name: statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statuses (id, title) FROM stdin;
1	Принят
2	Готовится
3	Готов
4	Выдан
5	Отменен
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, first_name, middle_name, last_name, email, phone) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, password_hash, role_id, created_at) FROM stdin;
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 3, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.statuses_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: statuses statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statuses
    ADD CONSTRAINT statuses_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_email_key UNIQUE (email);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_status_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_id ON public.orders USING btree (status_id);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- Name: order_items trg_calculate_item_price; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_calculate_item_price BEFORE INSERT OR UPDATE OF product_id, price ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.process_order_item_totals();


--
-- Name: order_items trg_update_order_total; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_order_total AFTER INSERT OR DELETE OR UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_order_total_price();


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: orders orders_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.statuses(id) ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


-- Синхронизация внутренних счетчиков автоинкремента PostgreSQL

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('statuses_id_seq', (SELECT MAX(id) FROM statuses));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

--
-- PostgreSQL database dump complete
--


