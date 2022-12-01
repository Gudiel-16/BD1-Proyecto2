/***************CONSULTA 1***************/
select t1.profesional, count(t1.invento) as 'inventos_asignados' from
(
	select profesional.nombre as 'profesional', invento.nombre as 'invento' from profesional
	join asigna_invento on asigna_invento.profesional_idd = profesional.idd
	join invento on invento.idd = asigna_invento.invento_idd
) t1 
group by t1.profesional
order by count(t1.invento) desc;

/***************CONSULTA 2***************/
select t1.pais as 'pais', t1.total as 'total' from /*obtengo los paises que contestaron preguntas*/
(
	select pais.nombre as 'pais', pais_respuesta.respuesta_idd as 'idr', count(pais.nombre) as 'total' from pais 
	join pais_respuesta on pais_respuesta.pais_idd = pais.idd
	group by pais.nombre
	order by pais.nombre asc
) t1
union
select nombre as 'pais', 0 as 'total' from pais /*obtengo los paises que no contestaron ninguna pregunta*/
where nombre not in 
	(
		select t1.pais as 'nombre' from
		(
			select pais.nombre as 'pais', pais_respuesta.respuesta_idd as 'idr', count(pais.nombre) as 'total' from pais 
			join pais_respuesta on pais_respuesta.pais_idd = pais.idd
			group by pais.nombre
			order by pais.nombre asc
		) t1 order by total desc
	)
order by total desc;

/***************CONSULTA 3***************/
select z2.nombre as 'pais', 
	(select t2.area from
		(
			select nombre, area from pais
        ) t2   
    where t2.nombre = z2.nombre) as 'area'
from
(
	select z1.nombre from /*obtengo paises que no tienen frontera y tampoco inventores*/
	(
		select pais.nombre as 'nombre' from pais /*paises que no tienen frontera*/
		join frontera on frontera.pais_idd = pais.idd and frontera.pais_idd2 is null
	) z1
	where z1.nombre in
	(
		select nombre from pais /*obtengo paises que no tienen inventores*/
		where nombre not in
		(
			select t1.nombre as 'nombre' from /*obtengo solo el nombre de pais que tienen inventores*/
			(
				select pais.nombre as 'nombre', count(inventor.nombre)  from pais /*paises que tienen inventores*/
				join inventor on inventor.pais_idd = pais.idd
				group by pais.nombre
			) t1
		)
	)
) z2 order by area desc;

/***************CONSULTA 4***************/
select profesional.nombre as 'jefe', areaa.nombre as 'area' from profesional
join areaa on areaa.jefe_idd = profesional.idd
union
select jefe_gen as 'jefe', nombre as 'area' from areaa
order by area asc;

/***************CONSULTA 5***************/
with z1 as 
(
	select profesional.nombre as 'profesional', profesional.salario as 'salario', areaa.nombre as 'area' from profesional
	join prof_areaa on prof_areaa.profesional_idd = profesional.idd
	join areaa on areaa.idd =prof_areaa.areaa_idd
)
select z1.profesional, z1.salario, z1.area, z2.promedio as 'salario_promedio' from
(
	select avg(t1.salario) as 'promedio', t1.area as 'area' from /*promedio por area*/
	(
		select profesional.nombre as 'profesional', profesional.salario as 'salario', areaa.nombre as 'area' from profesional /*todos los salarios*/
		join prof_areaa on prof_areaa.profesional_idd = profesional.idd
		join areaa on areaa.idd =prof_areaa.areaa_idd
	) t1
	group by t1.area
) z2 
join z1 on z1.area = z2.area and z1.salario > z2.promedio;

/***************CONSULTA 6***************/
select pais.nombre as 'pais', count(pais.nombre) as 'respuestas_correctas' from pais
join pais_respuesta on pais_respuesta.pais_idd = pais.idd
join respuesta on respuesta.idd = pais_respuesta.respuesta_idd
join respuesta_correcta on respuesta_correcta.respuesta_idd = respuesta.idd
group by pais.nombre
order by count(pais.nombre) desc;

/***************CONSULTA 7***************/
select profesional.nombre as 'profesional', invento.nombre as 'invento', areaa.nombre as 'area' from areaa
join prof_areaa on prof_areaa.areaa_idd = areaa.idd and areaa.nombre = 'Óptica'
join profesional on profesional.idd = prof_areaa.profesional_idd
join asigna_invento on asigna_invento.profesional_idd = profesional.idd
join invento on invento.idd = asigna_invento.invento_idd
order by areaa.nombre asc, invento.nombre asc;

/***************CONSULTA 8***************/
select t1.letra, sum(area) as 'area_total' from
(
	select nombre as 'pais',substring(nombre,1,1) as 'letra', area as 'area'
	from pais
) t1
group by t1.letra
order by t1.letra;

/***************CONSULTA 9***************/
select t1.inventor, t1.invento, t1.letras from
(
	select upper(inventor.nombre) as 'inventor', invento.nombre as 'invento', substring(upper(inventor.nombre),1,2) as 'letras' from inventor
	join inventado on inventado.inventor_idd = inventor.idd
	join invento on invento.idd = inventado.invento_idd
) t1 where t1.letras='BE';

/***************CONSULTA 10***************/
select t1.inventor, t1.invento, t1.anio, t1.letra_inicial, t1.letra_final from
(
	select upper(inventor.nombre) as 'inventor', invento.nombre as 'invento', invento.anio as 'anio', 
    substring(upper(inventor.nombre),1,1) as 'letra_inicial',  substring(upper(inventor.nombre),-1) as 'letra_final'
    from inventor
	join inventado on inventado.inventor_idd = inventor.idd
	join invento on invento.idd = inventado.invento_idd
) t1 where t1.letra_inicial = 'B' and (t1.letra_final = 'R' or t1.letra_final = 'N') and t1.anio >= 1900 and t1.anio <2000;

/***************CONSULTA 11***************/
select z2.pais, z2.area, z2.num_front 'numero de fronteras' from
(
	select z1.pais, z1.area, count(z1.pais) as 'num_front' from
	(
		select t1.nombre as 'pais', t1.area as 'area' from pais t1
		join frontera on frontera.pais_idd = t1.idd
		join pais t2 on frontera.pais_idd2 = t2.idd
	) z1
	group by z1.pais
) z2 
where z2.num_front > 7
order by area desc;

/***************CONSULTA 12***************/
select t2.invento, t2.tamanio, t2.letra_inicial from
(
	select t1.invento, t1.tamanio, t1.letra_inicial from
	(
		select upper(nombre) as 'invento', char_length(nombre) 'tamanio' , substring(upper(nombre),1,1) as 'letra_inicial' 
		from invento
	) t1
) t2 where t2.tamanio = 4 and t2.letra_inicial ='L';

/***************CONSULTA 13***************/
select t1.nombre, t1.salario, t1.comision, t1.salario_total, t1.porc_salario as 'porc_salario' from
(
	select nombre, salario, comision, sum(salario+comision) as 'salario_total', (salario*0.25) as 'porc_salario' 
	from profesional
	group by nombre
) t1 where t1.comision > t1.porc_salario;

/***************CONSULTA 14***************/
select t1.encuesta, count(t1.pais) as 'total' from
(
	select encuesta.nombre as 'encuesta', pais.nombre as 'pais' from pais
	join pais_respuesta on pais_respuesta.pais_idd = pais.idd
	join respuesta on respuesta.idd = pais_respuesta.respuesta_idd
	join pregunta on pregunta.idd = respuesta.pregunta_idd
	join encuesta on encuesta.idd= pregunta.encuesta_idd
	order by encuesta.nombre asc, pais.nombre asc
) t1
group by t1.encuesta
order by total desc;

/***************CONSULTA 15***************/
with z1 as
(
	select t1.region as 'region', sum(t1.poblacion) as 'total' from /*poblacion total de centro america*/
	(
		select pais.nombre, pais.poblacion, region.nombre as 'region' from pais
		join region on region.idd = pais.region_idd and region.nombre = 'Centro America'
	) t1
	group by t1.region
)
select t2.pais, t2.poblacion, t2.region, z1.total as 'poblacion_centroamerica' from
(
	select pais.nombre as 'pais', pais.poblacion, region.nombre as 'region' from pais /*poblacion de cada pais*/
	join region on region.idd = pais.region_idd
) t2
join z1 on t2.poblacion > z1.total
order by t2.poblacion desc;

/***************CONSULTA 16***************/
select z1.profesional, z1.invento, z1.area, z1.jefe, z1.jefe_gen from
(
	select t1.profesional, t1.invento, t1.area, t1.jefe_idd, t1.jefe_gen,
		(select t2.nombre from
			(
				select idd, nombre from profesional
			) t2
		where t2.idd = t1.jefe_idd) as 'jefe'
	from
	(
		select profesional.nombre as 'profesional', invento.nombre as 'invento', areaa.nombre as 'area', areaa.jefe_idd, areaa.jefe_gen
		from inventor
		join inventado on inventado.inventor_idd = inventor.idd and inventor.nombre = 'Pasteur'
		join invento on invento.idd = inventado.invento_idd
		join asigna_invento on asigna_invento.invento_idd = invento.idd
		join profesional on profesional.idd - asigna_invento.profesional_idd
		join prof_areaa on prof_areaa.profesional_idd = profesional.idd
		join areaa on areaa.idd = prof_areaa.areaa_idd
		order by areaa.nombre asc
	) t1
) z1 where z1.profesional <> z1.jefe_gen;

/***************CONSULTA 17***************/
select inventor.nombre as 'inventor', invento.nombre as 'invento', invento.anio as 'anio'
from inventor
join inventado on inventado.inventor_idd = inventor.idd
join invento on invento.idd = inventado.invento_idd and invento.anio =
	(select invento.anio as 'anio' /*retorna el anio de invento de Benz (solo hay un anio)*/
	from inventor
	join inventado on inventado.inventor_idd = inventor.idd and inventor.nombre = 'Benz'
	join invento on invento.idd = inventado.invento_idd
    limit 1
	);
    
/***************CONSULTA 18***************/
select pais.nombre as 'pais', pais.poblacion as 'poblacion', pais.area as 'area' from pais /*paises que no tienen frontera, que es lo mismo que islas*/
join frontera on frontera.pais_idd = pais.idd and frontera.pais_idd2 is null
where pais.area >= (
				select pais.area from pais
				where pais.nombre = 'Japon'
                limit 1
                )
order by pais.poblacion desc;

/***************CONSULTA 19***************/
select t1.nombre as 'pais', t2.nombre as 'frontera' from pais t1
join frontera on frontera.pais_idd = t1.idd
join pais t2 on frontera.pais_idd2 = t2.idd;

/***************CONSULTA 20***************/
select t1.nombre, t1.salario, t1.comision, t1.comision_doble from
(
	select nombre, salario, comision as 'comision', (2*comision) as 'comision_doble'
	from profesional
	group by nombre
) t1 where t1.salario > t1.comision_doble and t1.comision <> 0
order by t1.comision_doble desc;
