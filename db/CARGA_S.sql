/*load data local infile 'C:/BD1PY2/carga1.csv' 
into table temporal1 
character set latin1 
fields terminated by ';' 
lines terminated by '\n' 
ignore 1 lines 
(invento,inventor,profesional_asignado_al_invento,el_profesional_es_jefe_de,fecha_contrato_profesional,salario,comision,area_invest_del_prof,ranking,anio_del_invento,pais_del_invento,pais_del_inventor,region_del_pais,capital,poblacion_del_pais,area_en_km2,frontera_con,norte,sur,este,oeste);

load data local infile 'C:/BD1PY2/carga2.csv' 
into table temporal2 
character set latin1 
fields terminated by ';' 
lines terminated by '\n' 
ignore 1 lines 
(nombre_encuesta,pregunta,respuestas_posibles,respuesta_correcta,pais,respuesta_pais);

load data local infile 'C:/BD1PY2/carga3.csv' 
into table temporal3 
character set latin1 
fields terminated by ';' 
lines terminated by '\n' 
ignore 1 lines 
(nombre_region,region_padre);*/

insert into profesional (nombre,salario,fecha_contrato,comision) 
	select distinct profesional_asignado_al_invento, salario, fecha_contrato_profesional, comision from temporal1 
    where profesional_asignado_al_invento <> '';

insert into region (nombre) 
	select distinct nombre_region from temporal3;    

insert into encuesta (nombre)    
	select distinct nombre_encuesta from temporal2;

insert into region_region(region_idd, region_idd_padre)     
    select z1.id_region, z1.id_padre from
	(
		select t1.nombre_region, t1.region_padre,	/*obtengo nombre region y el padre*/	
			(select t2.idd from /*id de la region*/
				(
					select idd, nombre from region
				) t2
			where t2.nombre = t1.nombre_region ) as 'id_region',        
			(select t2.idd from /*id del padre*/
				(
					select idd, nombre from region
				) t2
			where t2.nombre = t1.region_padre ) as 'id_padre'        
		from temporal3 as t1
	) z1;

insert into pais(nombre, poblacion, area, capital, region_idd)
	select z1.pais_del_inventor, z1.poblacion_del_pais, z1.area_en_km2, z1.capital, z1.id_region from
	(
		select distinct pais_del_inventor, poblacion_del_pais, area_en_km2, capital, region_del_pais,
			(select t2.idd from
				(
					select idd, nombre from region
				) t2
			where t2.nombre=t1.region_del_pais) as 'id_region'    
		from temporal1 as t1
	) z1;
 
 insert into frontera (norte, sur, este, oeste, pais_idd, pais_idd2)
	 select z1.norte, z1.sur, z1.este, z1.oeste, z1.id_pais, z1.id_frontera from
	 (
		select distinct t1.norte, t1.sur, t1.este, t1.oeste, t1.pais_del_inventor, t1.frontera_con,
			(select t2.idd from
				(
					select idd, nombre from pais
				) t2
			where t2.nombre=t1.pais_del_inventor) as 'id_pais',
			(select t2.idd from
				(
					select idd, nombre from pais
				) t2
			where t2.nombre=t1.frontera_con) as 'id_frontera'    
		from temporal1 as t1
	) z1;

insert into inventor(nombre, pais_idd)
	select x2.inventor, x2.id_pais from
	(    
		select distinct inventor, pais_del_invento,
			(select t2.idd from
				(
					select idd, nombre from pais
				) t2
			where t2.nombre=x.pais_del_invento) as 'id_pais'
		from
		(
			select distinct inventor, pais_del_invento from temporal1 /*los que no tienen coma*/
			where inventor not like '%,%'
			union
			select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(inventor, ', ', 1), ', ', -1) as 'inventor', pais_del_invento from temporal1 /*obtengo solo primeros*/
			where inventor like '%,%'
			union
			select distinct t1.inventor, t1.pais_del_invento from
			(
				select distinct TRIM(SUBSTR(inventor, LOCATE(' ', inventor))) AS 'inventor', pais_del_invento from temporal1 /*obtengo los segundos para delante*/
				where inventor like '%,%'
			) t1 where t1.inventor not like '%,%'
			union    
			select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(z1.inventor, ', ', 1), ', ', -1) as 'inventor', z1.pais_del_invento from /*obtengo los primeros del trimp anterior*/
			(
				select distinct TRIM(SUBSTR(inventor, LOCATE(' ', inventor))) AS 'inventor', pais_del_invento from temporal1
				where inventor like '%,%'
			) z1
			union
			select z2.inventor, z2.pais_del_invento from
			(
				select distinct TRIM(SUBSTR(inventor, LOCATE(' ', z1.inventor))) AS 'inventor', z1.pais_del_invento from
				(
					select distinct TRIM(SUBSTR(inventor, LOCATE(' ', inventor))) AS 'inventor', pais_del_invento from temporal1
					where inventor like '%,%'
				) z1
			) z2 where z2.inventor <> ''
		) x where inventor <> '' order by inventor asc
	) x2;


insert into invento(nombre, anio, pais_idd)
	select z1.invento, z1.anio_del_invento, z1.id_pais from
    (
		select distinct invento, anio_del_invento, pais_del_invento, 
			(select t2.idd from
				(
					select idd, nombre from pais
				) t2
			where t2.nombre=t1.pais_del_invento) as 'id_pais'
		from temporal1 as t1
	) z1 where z1.invento <> '';

insert into inventado(inventor_idd,invento_idd)
	select x3.idd_inventor, x3.idd_invento from
	(
		select x2.inventor, x2.pais_del_invento, x2.invento, x2.anio_del_invento, x2.idd_pais,
			(select t2.idd from
				(
					select idd, nombre, pais_idd from inventor
				) t2
			where t2.nombre=x2.inventor and t2.pais_idd = x2.idd_pais) as 'idd_inventor',
			(select t2.idd from
				(
					select idd, nombre, pais_idd from invento
				) t2
			where t2.nombre=x2.invento and t2.pais_idd = x2.idd_pais) as 'idd_invento'
		from
		(
			select distinct inventor, pais_del_invento, invento, anio_del_invento, 
				(select t2.idd from
					(
						select idd, nombre from pais
					) t2
				where t2.nombre=x.pais_del_invento) as 'idd_pais'
			from
			(
				select distinct inventor, pais_del_invento, invento, anio_del_invento from temporal1 /*los que no tienen coma*/
				where inventor not like '%,%'
				union
				select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(inventor, ', ', 1), ', ', -1) as 'inventor', pais_del_invento, invento, anio_del_invento from temporal1 /*obtengo solo primeros*/
				where inventor like '%,%'
				union
				select distinct t1.inventor, t1.pais_del_invento, t1.invento, t1.anio_del_invento from
				(
					select distinct TRIM(SUBSTR(inventor, LOCATE(' ', inventor))) AS 'inventor', pais_del_invento, invento, anio_del_invento from temporal1 /*obtengo los segundos para delante*/
					where inventor like '%,%'
				) t1 where t1.inventor not like '%,%'
				union    
				select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(z1.inventor, ', ', 1), ', ', -1) as 'inventor', z1.pais_del_invento, z1.invento, z1.anio_del_invento from /*obtengo los primeros del trimp anterior*/
				(
					select distinct TRIM(SUBSTR(inventor, LOCATE(' ', inventor))) AS 'inventor', pais_del_invento, invento, anio_del_invento from temporal1
					where inventor like '%,%'
				) z1
				union
				select z2.inventor, z2.pais_del_invento, z2.invento, z2.anio_del_invento from
				(
					select distinct TRIM(SUBSTR(inventor, LOCATE(' ', z1.inventor))) AS 'inventor', z1.pais_del_invento, z1.invento, z1.anio_del_invento from
					(
						select distinct TRIM(SUBSTR(inventor, LOCATE(' ', inventor))) AS 'inventor', pais_del_invento, invento, anio_del_invento from temporal1
						where inventor like '%,%'
					) z1
				) z2 where z2.inventor <> ''
			) x where inventor <> '' order by invento asc
		) x2
	) x3;   
     
insert into areaa(nombre,ranking,jefe_gen,jefe_idd)
	 select z2.area_invest_del_prof, z2.ranking, z2.jefe_general, z2.id_jefe from
	 (
		 select z1.area_invest_del_prof, z1.ranking, z1.jefe_general, z1.jefe, 
			(select t1.idd from
				(
					select idd, nombre from profesional
				) t1
			where z1.jefe = t1.nombre) as 'id_jefe'
		 from
		 (
			select distinct area_invest_del_prof, ranking,
				(
					select distinct profesional_asignado_al_invento from temporal1 where el_profesional_es_jefe_de = 'TODAS'    
				) as 'jefe_general',
				( select t2.profesional_asignado_al_invento from
					(
						select distinct el_profesional_es_jefe_de, profesional_asignado_al_invento from temporal1
						where el_profesional_es_jefe_de <> ''
					) t2
				where t2.el_profesional_es_jefe_de = t1.area_invest_del_prof) as 'jefe'		
			from temporal1 as t1
		) z1
	) z2 where area_invest_del_prof <> '';

insert into prof_areaa(profesional_idd, areaa_idd)
	select z1.idd_profesional, z1.idd_area from
	(
		select distinct profesional_asignado_al_invento, area_invest_del_prof,
			(select t2.idd from
				(
					select idd, nombre from profesional
				) t2        
			where t2.nombre = t1.profesional_asignado_al_invento) as 'idd_profesional',    
			(select t2.idd from
				(
					select idd, nombre from areaa
				) t2        
			where t2.nombre = t1.area_invest_del_prof) as 'idd_area'
		from temporal1 as t1
	) z1 where z1.idd_profesional <> '';

insert into asigna_invento(invento_idd, profesional_idd)    
	select z1.idd_invento, z1.idd_profesional from
	(
		select distinct profesional_asignado_al_invento, invento, anio_del_invento, 
			(select t2.idd from
				(
					select idd, nombre from profesional
				) t2
			where t2.nombre = t1.profesional_asignado_al_invento) as 'idd_profesional',
			(select t2.idd from
				(
					select idd, nombre, anio from invento
				) t2
			where t2.nombre = t1.invento and t2.anio = t1.anio_del_invento) as 'idd_invento'
		from temporal1 t1
	) z1 where z1.idd_invento <> '';

insert into pregunta(pregunta, encuesta_idd)    
	select z1.pregunta, z1.id_encuesta from
	(
		select distinct pregunta, nombre_encuesta, 
			( select t2.idd from
				(
					select idd, nombre from encuesta
				) t2
			where t2.nombre = t1.nombre_encuesta) as 'id_encuesta'
		from temporal2 as t1
	) z1;

insert into respuesta(respuesta, letra, pregunta_idd)
	select z1.respuestas_posibles, z1.letra, z1.id_pregunta from
	 (
		select distinct respuestas_posibles, pregunta, 
			(select substring(t1.respuestas_posibles,1,1)) as 'letra',
			(select t2.idd from
				(
					select idd, pregunta from pregunta
				) t2
			where t2.pregunta = t1.pregunta) as 'id_pregunta'
		from temporal2 as t1
	) z1;

insert into respuesta_correcta(pregunta_idd, respuesta_idd)
	select z2.id_pregunta, z2.id_respuesta from
	( 
		select z1.pregunta, z1.respuesta_correcta, z1.id_pregunta, 
			 (select t2.idd from
				(
					select idd, respuesta, pregunta_idd from respuesta
				) t2
			where t2.respuesta = z1.respuesta_correcta and t2.pregunta_idd = z1.id_pregunta) as 'id_respuesta'
		from
		(
			select distinct pregunta, respuesta_correcta,
				(select t2.idd from
					(
						select idd, pregunta from pregunta
					) t2
				where t2.pregunta = t1.pregunta) as 'id_pregunta'
			from temporal2 as t1
		) z1
	) z2;
 
insert into pais_respuesta(pais_idd, respuesta_idd) 
	 select z1.id_pais, z1.id_respuesta from
	 (
		 select x2.nombre_encuesta, x2.pregunta, x2.respuestas_posibles, x2.respuesta_correcta, x2.pais, x2.respuesta_pais, x2.id_pais, x2.id_pregunta, 
			(select t2.idd from
				(
					select idd, respuesta, letra, pregunta_idd from respuesta
				) t2
			where t2.letra=x2.respuesta_pais and t2.pregunta_idd=x2.id_pregunta) as 'id_respuesta'
		 from
		 (
			select x.nombre_encuesta, x.pregunta, x.respuestas_posibles, x.respuesta_correcta, x.pais, x.respuesta_pais,
				(select t2.idd from
					(
						select idd, nombre from pais
					) t2
				where t2.nombre=x.pais) as 'id_pais',
				(select t2.idd from
					(
						select idd, pregunta from pregunta
					) t2
				where t2.pregunta=x.pregunta) as 'id_pregunta'
			from
			(
				select nombre_encuesta, pregunta, respuestas_posibles, respuesta_correcta, CONCAT('', TRIM(pais), '') as pais, respuesta_pais			
				from temporal2 as t1	
				limit 2000
			) x
		) x2 limit 2000
	) z1 limit 2000; 

