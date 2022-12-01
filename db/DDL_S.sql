create table temporal1(
	invento varchar(100),
	inventor varchar(100),
    profesional_asignado_al_invento varchar(100),
    el_profesional_es_jefe_de varchar(100),
    fecha_contrato_profesional varchar(100),
    salario int,
    comision int,
    area_invest_del_prof varchar(100),
    ranking int,
    anio_del_invento int,
    pais_del_invento varchar(100),
    pais_del_inventor varchar(100),
    region_del_pais varchar(100),
    capital varchar(100),
    poblacion_del_pais int,
    area_en_km2 int,
    frontera_con varchar(100),
    norte char(1),
    sur char(1),
    este char(1),
    oeste char(1)
);
create table temporal2
(
	nombre_encuesta varchar(100),
    pregunta varchar(400),
    respuestas_posibles varchar(100),
    respuesta_correcta varchar(100),
    pais varchar(100),
    respuesta_pais char(1)    
);

create table temporal3
(
	nombre_region varchar(100),
    region_padre varchar(100) default null
);

create table usuario
(
	nombre varchar(100),
    pass varchar(100)
);

insert into usuario(nombre,pass) values('admin','admin');

create table inventado
(
	inventor_idd integer,
    invento_idd integer
);

create table inventor
(
	idd integer auto_increment primary key,
    nombre varchar(100),
    pais_idd integer    
);

create table invento
(
	idd integer auto_increment primary key,
    nombre varchar(100),
    anio integer,
    pais_idd integer
);

create table profesional
(
	idd integer auto_increment primary key,
    nombre varchar(100),
    salario decimal(8,2),
    fecha_contrato varchar(100),
    comision decimal(8,2)
);

create table prof_areaa
(
	profesional_idd integer,
    areaa_idd integer
);

create table areaa
(
	idd integer auto_increment primary key,
    nombre varchar(100),
    ranking integer,
    jefe_gen varchar(100),
    jefe_idd integer
); 

create table asigna_invento
(
	invento_idd integer,
    profesional_idd integer
);

create table encuesta
(
	idd integer auto_increment primary key,
    nombre varchar(100)
);

create table pregunta
(
	idd integer auto_increment primary key,
    pregunta varchar(300),
    encuesta_idd integer
);

create table frontera
(
	norte char(1),
    sur char(1),
    este char(1),
    oeste char(1),
    pais_idd integer,
    pais_idd2 integer
);

create table pais
(
	idd integer auto_increment primary key,
    nombre varchar(100),
    poblacion integer,
    area integer,
    capital varchar(100),
    region_idd integer
);

create table pais_respuesta
(
	pais_idd integer,
    respuesta_idd integer
);

create table respuesta_correcta
(
	pregunta_idd integer,
    respuesta_idd integer
);

create table respuesta
(
	idd integer auto_increment primary key,
    respuesta varchar(100),
    letra char(1),
    pregunta_idd integer
);

create table region
(
	idd integer auto_increment primary key,
    nombre varchar(100)
);

create table region_region
(
	region_idd integer,
    region_idd_padre integer
);

ALTER TABLE inventado ADD FOREIGN KEY(inventor_idd) REFERENCES inventor(idd);
ALTER TABLE inventado ADD FOREIGN KEY(invento_idd) REFERENCES invento(idd);

ALTER TABLE inventor ADD FOREIGN KEY(pais_idd) REFERENCES pais(idd);

ALTER TABLE invento ADD FOREIGN KEY(pais_idd) REFERENCES pais(idd);

ALTER TABLE areaa ADD FOREIGN KEY(jefe_idd) REFERENCES profesional(idd);

ALTER TABLE prof_areaa ADD FOREIGN KEY(profesional_idd) REFERENCES profesional(idd);
ALTER TABLE prof_areaa ADD FOREIGN KEY(areaa_idd) REFERENCES areaa(idd);

ALTER TABLE asigna_invento ADD FOREIGN KEY(invento_idd) REFERENCES invento(idd);
ALTER TABLE asigna_invento ADD FOREIGN KEY(profesional_idd) REFERENCES profesional(idd);

ALTER TABLE pais ADD FOREIGN KEY(region_idd) REFERENCES region(idd);

ALTER TABLE frontera ADD FOREIGN KEY(pais_idd) REFERENCES pais(idd);
ALTER TABLE frontera ADD FOREIGN KEY(pais_idd2) REFERENCES pais(idd);

ALTER TABLE region_region ADD FOREIGN KEY(region_idd) REFERENCES region(idd);
ALTER TABLE region_region ADD FOREIGN KEY(region_idd_padre) REFERENCES region(idd);

ALTER TABLE pregunta ADD FOREIGN KEY(encuesta_idd) REFERENCES encuesta(idd);

ALTER TABLE respuesta ADD FOREIGN KEY(pregunta_idd) REFERENCES pregunta(idd);

ALTER TABLE respuesta_correcta ADD FOREIGN KEY(pregunta_idd) REFERENCES pregunta(idd);
ALTER TABLE respuesta_correcta ADD FOREIGN KEY(respuesta_idd) REFERENCES respuesta(idd);

ALTER TABLE pais_respuesta ADD FOREIGN KEY(pais_idd) REFERENCES pais(idd);
ALTER TABLE pais_respuesta ADD FOREIGN KEY(respuesta_idd) REFERENCES respuesta(idd);

/*drop table region_region;
drop table frontera;
drop table inventado;
drop table asigna_invento;
drop table pais_respuesta;
drop table inventor;
drop table invento;
drop table pais;
drop table region;
drop table prof_areaa;
drop table areaa;
drop table profesional;
drop table respuesta_correcta;
drop table respuesta;
drop table pregunta;
drop table encuesta;*/
/*
drop table temporal1;
drop table temporal2;
drop table temporal3;
drop table usuario;*/