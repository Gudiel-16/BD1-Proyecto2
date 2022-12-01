const express = require('express');
const router = express.Router();

const pool = require('../database');

router.get('/add', (req,res)=>{
    res.render('links/add');
});

/*INSERTA USUARIO EN DB*/
router.post('/add', async (req,res)=>{
    const {nombre, pass} = req.body;
    const newLink = {
        nombre,
        pass
    };

    try {
        await pool.query('INSERT INTO usuario set ?', [newLink]);
        res.render('links/usuario_creado');
    } catch (e) {
        res.render('links/error_consulta');
    }    
});

router.post('/inisesion', async (req, res) => {
    const {nombre, pass} = req.body;
    var consulta="SELECT * FROM usuario WHERE nombre = \"" + nombre + "\" and pass = \"" + pass + "\";";
    const result = await pool.query(consulta);

    if (result.length >=1) {
        const dat = result[0];
        const text= 'Hola ' + dat["nombre"] + ' que ilusion tenerte con nosotros!';
        req.flash('success',text);
        res.redirect('/links/home');
    }    
});

router.get('/home', async (req, res) => {

    res.render('links/home');    

});

router.get('/home/consulta1', async (req, res) => {

    var consulta ="\
    select t1.profesional, count(t1.invento) as 'inventos_asignados' from\
    (\
        select profesional.nombre as 'profesional', invento.nombre as 'invento' from profesional\
        join asigna_invento on asigna_invento.profesional_idd = profesional.idd\
        join invento on invento.idd = asigna_invento.invento_idd\
    ) t1 \
    group by t1.profesional\
    order by count(t1.invento) desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta1', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }   
});

router.get('/home/consulta2', async (req, res) => {

    var consulta ="\
    select t1.pais as 'pais', t1.total as 'total' from /*obtengo los paises que contestaron preguntas*/\
    (\
        select pais.nombre as 'pais', pais_respuesta.respuesta_idd as 'idr', count(pais.nombre) as 'total' from pais\
        join pais_respuesta on pais_respuesta.pais_idd = pais.idd\
        group by pais.nombre\
        order by pais.nombre asc\
    ) t1\
    union\
    select nombre as 'pais', 0 as 'total' from pais /*obtengo los paises que no contestaron ninguna pregunta*/\
    where nombre not in\
        (\
            select t1.pais as 'nombre' from\
            (\
                select pais.nombre as 'pais', pais_respuesta.respuesta_idd as 'idr', count(pais.nombre) as 'total' from pais\
                join pais_respuesta on pais_respuesta.pais_idd = pais.idd\
                group by pais.nombre\
                order by pais.nombre asc\
            ) t1 order by total desc\
        )\
    order by total desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta2', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta3', async (req, res) => {

    var consulta ="\
    select z2.nombre as 'pais',\
        (select t2.area from\
            (\
                select nombre, area from pais\
            ) t2   \
        where t2.nombre = z2.nombre) as 'area'\
    from\
    (\
        select z1.nombre from /*obtengo paises que no tienen frontera y tampoco inventores*/\
        (\
            select pais.nombre as 'nombre' from pais /*paises que no tienen frontera*/\
            join frontera on frontera.pais_idd = pais.idd and frontera.pais_idd2 is null\
        ) z1\
        where z1.nombre in\
        (\
            select nombre from pais /*obtengo paises que no tienen inventores*/\
            where nombre not in\
            (\
                select t1.nombre as 'nombre' from /*obtengo solo el nombre de pais que tienen inventores*/\
                (\
                    select pais.nombre as 'nombre', count(inventor.nombre)  from pais /*paises que tienen inventores*/\
                    join inventor on inventor.pais_idd = pais.idd\
                    group by pais.nombre\
                ) t1\
            )\
        )\
    ) z2 order by area desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta3', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta4', async (req, res) => {

    var consulta ="\
    select profesional.nombre as 'jefe', areaa.nombre as 'area' from profesional\
    join areaa on areaa.jefe_idd = profesional.idd\
    union\
    select jefe_gen as 'jefe', nombre as 'area' from areaa\
    order by area asc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta4', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta5', async (req, res) => {

    var consulta ="\
    with z1 as \
    (\
        select profesional.nombre as 'profesional', profesional.salario as 'salario', areaa.nombre as 'area' from profesional\
        join prof_areaa on prof_areaa.profesional_idd = profesional.idd\
        join areaa on areaa.idd =prof_areaa.areaa_idd\
    )\
    select z1.profesional, z1.salario, z1.area, z2.promedio as 'salario_promedio' from\
    (\
        select avg(t1.salario) as 'promedio', t1.area as 'area' from /*promedio por area*/\
        (\
            select profesional.nombre as 'profesional', profesional.salario as 'salario', areaa.nombre as 'area' from profesional /*todos los salarios*/\
            join prof_areaa on prof_areaa.profesional_idd = profesional.idd\
            join areaa on areaa.idd =prof_areaa.areaa_idd\
        ) t1\
        group by t1.area\
    ) z2 \
    join z1 on z1.area = z2.area and z1.salario > z2.promedio;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta5', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta6', async (req, res) => {

    var consulta ="\
    select pais.nombre as 'pais', count(pais.nombre) as 'respuestas_correctas' from pais\
    join pais_respuesta on pais_respuesta.pais_idd = pais.idd\
    join respuesta on respuesta.idd = pais_respuesta.respuesta_idd\
    join respuesta_correcta on respuesta_correcta.respuesta_idd = respuesta.idd\
    group by pais.nombre\
    order by count(pais.nombre) desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta6', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta7', async (req, res) => {

    var consulta ="\
    select profesional.nombre as 'profesional', invento.nombre as 'invento', areaa.nombre as 'area' from areaa\
    join prof_areaa on prof_areaa.areaa_idd = areaa.idd and areaa.nombre = 'Óptica'\
    join profesional on profesional.idd = prof_areaa.profesional_idd\
    join asigna_invento on asigna_invento.profesional_idd = profesional.idd\
    join invento on invento.idd = asigna_invento.invento_idd\
    order by areaa.nombre asc, invento.nombre asc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta7', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta8', async (req, res) => {

    var consulta ="\
    select t1.letra, sum(area) as 'area_total' from\
    (\
        select nombre as 'pais',substring(nombre,1,1) as 'letra', area as 'area'\
        from pais\
    ) t1\
    group by t1.letra\
    order by t1.letra;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta8', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta9', async (req, res) => {

    var consulta ="\
    select t1.inventor, t1.invento, t1.letras from\
    (\
        select upper(inventor.nombre) as 'inventor', invento.nombre as 'invento', substring(upper(inventor.nombre),1,2) as 'letras' from inventor\
        join inventado on inventado.inventor_idd = inventor.idd\
        join invento on invento.idd = inventado.invento_idd\
    ) t1 where t1.letras='BE';";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta9', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta10', async (req, res) => {

    var consulta ="\
    select t1.inventor, t1.invento, t1.anio, t1.letra_inicial, t1.letra_final from\
    (\
        select upper(inventor.nombre) as 'inventor', invento.nombre as 'invento', invento.anio as 'anio',\
        substring(upper(inventor.nombre),1,1) as 'letra_inicial',  substring(upper(inventor.nombre),-1) as 'letra_final'\
        from inventor\
        join inventado on inventado.inventor_idd = inventor.idd\
        join invento on invento.idd = inventado.invento_idd\
    ) t1 where t1.letra_inicial = 'B' and (t1.letra_final = 'R' or t1.letra_final = 'N') and t1.anio >= 1900 and t1.anio <2000;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta10', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta11', async (req, res) => {

    var consulta ="\
    select z2.pais, z2.area, z2.num_front 'numero_de_fronteras' from\
    (\
        select z1.pais, z1.area, count(z1.pais) as 'num_front' from\
        (\
            select t1.nombre as 'pais', t1.area as 'area' from pais t1\
            join frontera on frontera.pais_idd = t1.idd\
            join pais t2 on frontera.pais_idd2 = t2.idd\
        ) z1\
        group by z1.pais\
    ) z2 \
    where z2.num_front > 7\
    order by area desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta11', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta12', async (req, res) => {

    var consulta ="\
    select t2.invento, t2.tamanio, t2.letra_inicial from\
    (\
        select t1.invento, t1.tamanio, t1.letra_inicial from\
        (\
            select upper(nombre) as 'invento', char_length(nombre) 'tamanio' , substring(upper(nombre),1,1) as 'letra_inicial'\
            from invento\
        ) t1\
    ) t2 where t2.tamanio = 4 and t2.letra_inicial ='L';";

    
    try {
        const result = await pool.query(consulta);
        res.render('links/consulta12', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta13', async (req, res) => {

    var consulta ="\
    select t1.nombre, t1.salario, t1.comision, t1.salario_total, t1.porc_salario as 'porc_salario' from\
    (\
        select nombre, salario, comision, sum(salario+comision) as 'salario_total', (salario*0.25) as 'porc_salario'\
        from profesional\
        group by nombre\
    ) t1 where t1.comision > t1.porc_salario;";

    
    try {
        const result = await pool.query(consulta);
        res.render('links/consulta13', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta14', async (req, res) => {

    var consulta ="\
    select t1.encuesta, count(t1.pais) as 'total' from\
    (\
        select encuesta.nombre as 'encuesta', pais.nombre as 'pais' from pais\
        join pais_respuesta on pais_respuesta.pais_idd = pais.idd\
        join respuesta on respuesta.idd = pais_respuesta.respuesta_idd\
        join pregunta on pregunta.idd = respuesta.pregunta_idd\
        join encuesta on encuesta.idd= pregunta.encuesta_idd\
        order by encuesta.nombre asc, pais.nombre asc\
    ) t1\
    group by t1.encuesta\
    order by total desc;";

    
    try {
        const result = await pool.query(consulta);
        res.render('links/consulta14', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta15', async (req, res) => {

    var consulta ="\
    with z1 as\
    (\
        select t1.region as 'region', sum(t1.poblacion) as 'total' from /*poblacion total de centro america*/\
        (\
            select pais.nombre, pais.poblacion, region.nombre as 'region' from pais\
            join region on region.idd = pais.region_idd and region.nombre = 'Centro America'\
        ) t1\
        group by t1.region\
    )\
    select t2.pais, t2.poblacion, t2.region, z1.total as 'poblacion_centroamerica' from\
    (\
        select pais.nombre as 'pais', pais.poblacion, region.nombre as 'region' from pais /*poblacion de cada pais*/\
        join region on region.idd = pais.region_idd\
    ) t2\
    join z1 on t2.poblacion > z1.total\
    order by t2.poblacion desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta15', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta16', async (req, res) => {

    var consulta ="\
    select z1.profesional, z1.invento, z1.area, z1.jefe, z1.jefe_gen from\
    (\
        select t1.profesional, t1.invento, t1.area, t1.jefe_idd, t1.jefe_gen,\
            (select t2.nombre from\
                (\
                    select idd, nombre from profesional\
                ) t2\
            where t2.idd = t1.jefe_idd) as 'jefe'\
        from\
        (\
            select profesional.nombre as 'profesional', invento.nombre as 'invento', areaa.nombre as 'area', areaa.jefe_idd, areaa.jefe_gen\
            from inventor\
            join inventado on inventado.inventor_idd = inventor.idd and inventor.nombre = 'Pasteur'\
            join invento on invento.idd = inventado.invento_idd\
            join asigna_invento on asigna_invento.invento_idd = invento.idd\
            join profesional on profesional.idd - asigna_invento.profesional_idd\
            join prof_areaa on prof_areaa.profesional_idd = profesional.idd\
            join areaa on areaa.idd = prof_areaa.areaa_idd\
            order by areaa.nombre asc\
        ) t1\
    ) z1 where z1.profesional <> z1.jefe_gen;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta16', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  

});

router.get('/home/consulta17', async (req, res) => {

    var consulta ="\
    select inventor.nombre as 'inventor', invento.nombre as 'invento', invento.anio as 'anio'\
    from inventor\
    join inventado on inventado.inventor_idd = inventor.idd\
    join invento on invento.idd = inventado.invento_idd and invento.anio =\
        (select invento.anio as 'anio' /*retorna el anio de invento de Benz (solo hay un anio)*/\
        from inventor\
        join inventado on inventado.inventor_idd = inventor.idd and inventor.nombre = 'Benz'\
        join invento on invento.idd = inventado.invento_idd\
        limit 1\
        );";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta17', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }    
});

router.get('/home/consulta18', async (req, res) => {

    var consulta ="\
    select pais.nombre as 'pais', pais.poblacion as 'poblacion', pais.area as 'area' from pais /*paises que no tienen frontera, que es lo mismo que islas*/\
    join frontera on frontera.pais_idd = pais.idd and frontera.pais_idd2 is null\
    where pais.area >= (\
                    select pais.area from pais\
                    where pais.nombre = 'Japon'\
                    limit 1\
                    )\
    order by pais.poblacion desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta18', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }   
});

router.get('/home/consulta19', async (req, res) => {

    var consulta ="\
    select t1.nombre as 'pais', t2.nombre as 'frontera' from pais t1\
    join frontera on frontera.pais_idd = t1.idd\
    join pais t2 on frontera.pais_idd2 = t2.idd;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta19', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

router.get('/home/consulta20', async (req, res) => {

    var consulta ="\
    select t1.nombre, t1.salario, t1.comision, t1.comision_doble from\
    (\
        select nombre, salario, comision as 'comision', (2*comision) as 'comision_doble'\
        from profesional\
        group by nombre\
    ) t1 where t1.salario > t1.comision_doble and t1.comision <> 0\
    order by t1.comision_doble desc;";

    try {
        const result = await pool.query(consulta);
        res.render('links/consulta20', {result});
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

/**--------------CRUD PAIS--------------**/
router.get('/home/crud_pais', async (req,res)=>{

    var consulta="SELECT idd, nombre, poblacion, area, capital FROM pais order by nombre asc;";
    const result = await pool.query(consulta);

    var consulta2="SELECT idd, nombre FROM region;";
    const result2 = await pool.query(consulta2);

    var consulta3="\
    select respuesta.idd, pregunta.pregunta, respuesta.respuesta\
    from pregunta\
    join respuesta on respuesta.pregunta_idd = pregunta.idd\
    order by pregunta.pregunta asc, respuesta.respuesta asc;";
    const result3 = await pool.query(consulta3);

    res.render('links/crud_pais', {result,result2,result3});
});

/*agregar pais*/
router.post('/home/ag_pais', async (req,res)=>{
    const {pais,poblacion,area,capital,region}= req.body;
    const nombre = pais;
    const region_idd = region;
    const nuevoPais = {
        nombre,
        poblacion,
        area,
        capital,
        region_idd
    };
    //console.log(nuevoPais);    

    try {
        await pool.query('INSERT INTO pais set ?', [nuevoPais]);
        req.flash('success', 'SE AGREGO EL PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    }
});

//agregar frontera
router.post('/home/ag_frontera', async (req,res)=>{
    const {pais_idd,pais_idd2,norte,sur,este,oeste}= req.body;
    const nuevaFrontera = {
        norte,
        sur,
        este,
        oeste,
        pais_idd,
        pais_idd2
    };
    //console.log(nuevaFrontera);

    try {
        await pool.query('INSERT INTO frontera set ?', [nuevaFrontera]);
        req.flash('success', 'SE AGREGO FRONTERA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    }
});

//agregar PAIS RESPUESTA
router.post('/home/ag_paisrespuesta', async (req,res)=>{
    const {pais_idd,respuesta_idd}= req.body;
    const nuevaRes = {        
        pais_idd,
        respuesta_idd
    };
    //console.log(nuevaRes);

    try {
        await pool.query('INSERT INTO pais_respuesta set ?', [nuevaRes]);
        req.flash('success', 'SE AGREGO RESPUESTA DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    }    
});

//modificar nombre pais
router.post('/home/mod_nombrepais', async (req,res)=>{
    const {idd, nombre}= req.body;
    
    //console.log(idd,nombre);    
    
    try {
        await pool.query('UPDATE pais set nombre = ? WHERE idd = ?', [nombre,idd]);
        req.flash('success', 'SE MODIFICO EL NOMBRE DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    }   
});

//modificar poblacion pais
router.post('/home/mod_poblacionpais', async (req,res)=>{
    const {idd, poblacion}= req.body;
    
    //console.log(idd,poblacion);    
    
    try {
        await pool.query('UPDATE pais set poblacion = ? WHERE idd = ?', [poblacion,idd]);
        req.flash('success', 'SE MODIFICO LA POBLACION DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//modificar area pais
router.post('/home/mod_areapais', async (req,res)=>{
    const {idd, area}= req.body;
    
    //console.log(idd, area);    
    
    try {
        await pool.query('UPDATE pais set area = ? WHERE idd = ?', [area,idd]);
        req.flash('success', 'SE MODIFICO EL AREA DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//modificar capital pais
router.post('/home/mod_capitalpais', async (req,res)=>{
    const {idd, capital}= req.body;
    
    //console.log(idd, capital);    
    
    try {
        await pool.query('UPDATE pais set capital = ? WHERE idd = ?', [capital,idd]);
        req.flash('success', 'SE MODIFICO LA CAPITAL DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//modificar region pais
router.post('/home/mod_regionpais', async (req,res)=>{
    const {idd, region_idd}= req.body;
    
    //console.log(idd, region_idd);    
    
    try {
        await pool.query('UPDATE pais set region_idd = ? WHERE idd = ?', [region_idd,idd]);
        req.flash('success', 'SE MODIFICO LA REGION DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//modificar frontera
router.post('/home/mod_frontera', async (req,res)=>{
    const {pais_idd, pais_idd2, pais_idd3, norte, sur, este, oeste}= req.body;
    
    //console.log(pais_idd, pais_idd2, pais_idd3, norte, sur, este, oeste);
    
    try {
        await pool.query('UPDATE frontera set norte = ?, sur = ?, este = ?, oeste = ?, pais_idd2 = ? WHERE pais_idd = ? and pais_idd2 = ?', [norte, sur, este, oeste,pais_idd3,pais_idd,pais_idd2]);
        req.flash('success', 'SE MODIFICO LA FRONTERA DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//modificar pais respuesta
router.post('/home/mod_paisrespuesta', async (req,res)=>{
    const {pais_idd, respuesta_idd, newrespuesta_idd}= req.body;
    
    //console.log(pais_idd, respuesta_idd, newrespuesta_idd);    
    
    try {
        await pool.query('UPDATE pais_respuesta set respuesta_idd = ? WHERE pais_idd = ? and respuesta_idd = ?', [newrespuesta_idd,pais_idd,respuesta_idd]);
        req.flash('success', 'SE MODIFICO LA RESPUESTA DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//eliminar pais
router.post('/home/eliminar_pais', async (req,res)=>{
    const {pais_idd}= req.body;

    //console.log(pais_idd);

    try {
        await pool.query('DELETE FROM pais WHERE idd = ?', [pais_idd]);
        req.flash('success', 'SE ELIMINO EL PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_eliminarpais')
    }    
});

//eliminar frontera
router.post('/home/eliminar_frontera', async (req,res)=>{
    const {pais_idd, pais_idd2}= req.body;
    
    //console.log(pais_idd, pais_idd2);
    
    try {
        await pool.query('DELETE FROM frontera WHERE pais_idd = ? and pais_idd2 = ?', [pais_idd,pais_idd2]);
        req.flash('success', 'SE ELIMINO FRONTERA DEL PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    }    
});

//eliminar respuesta de pais
router.post('/home/eliminar_paisrespuesta', async (req,res)=>{
    const {pais_idd, respuesta_idd}= req.body;
    
    //console.log(pais_idd, respuesta_idd);
      
    try {
        await pool.query('DELETE FROM pais_respuesta WHERE pais_idd = ? and respuesta_idd = ?', [pais_idd,respuesta_idd]);
        req.flash('success', 'SE ELIMINO RESPUESTA DE PAIS EXITOSAMENTE!');
        res.redirect('/links/home/crud_pais');
    } catch (e) {
        res.render('links/error_consulta');
    }    
});

/**--------------CRUD PREGUNTA--------------**/
router.get('/home/crud_pregunta', async (req,res)=>{

    var consulta="SELECT idd, pregunta FROM pregunta;";
    const result = await pool.query(consulta);

    var consulta2="SELECT idd, nombre FROM encuesta;";
    const result2 = await pool.query(consulta2);

    var consulta3="SELECT idd, respuesta, letra FROM respuesta order by respuesta asc;";
    const result3 = await pool.query(consulta3);

    var consulta4="select pregunta.pregunta, respuesta.respuesta, respuesta.letra from pregunta join respuesta on respuesta.pregunta_idd = pregunta.idd order by pregunta.pregunta asc, respuesta.respuesta asc;";
    const result4 = await pool.query(consulta4);

    var consulta5="\
    select pregunta.pregunta, respuesta.respuesta as 'respuesta_correcta', respuesta.letra\
    from pregunta \
    join respuesta on respuesta.pregunta_idd = pregunta.idd \
    join respuesta_correcta on respuesta_correcta.respuesta_idd = respuesta.idd and respuesta_correcta.pregunta_idd = pregunta.idd\
    order by pregunta.pregunta asc, respuesta.respuesta asc;";
    const result5 = await pool.query(consulta5);

    res.render('links/crud_pregunta', {result,result2,result3,result4,result5});
});

/*agregar pregunta*/
router.post('/home/ag_pregunta', async (req,res)=>{
    const {pregunta,encuesta_idd}= req.body;
    const nuevoPregunta = {
        pregunta,
        encuesta_idd
    };

    //console.log(nuevoPregunta);
    
    try {
        await pool.query('INSERT INTO pregunta set ?', [nuevoPregunta]);
        req.flash('success', 'SE AGREGO PREGUNTA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pregunta');
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

//agregar respuesta
router.post('/home/ag_respuesta', async (req,res)=>{
    const {pregunta_idd,respuesta}= req.body;
    const letra = respuesta.substr(0,1);
    const nuevaRespuesta = {
        respuesta,
        letra,
        pregunta_idd
    };

    //console.log(nuevaRespuesta);

    try {
        await pool.query('INSERT INTO respuesta set ?', [nuevaRespuesta]);
        req.flash('success', 'SE AGREGO RESPUESTA A PREGUNTA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pregunta');
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

//agregar respuesta correcta
router.post('/home/ag_respuestacorrecta', async (req,res)=>{
    const {pregunta_idd,respuesta_idd}= req.body;
    const nuevaRespuesta = {
        pregunta_idd,
        respuesta_idd
    };

    //console.log(nuevaRespuesta);

    try {
        await pool.query('INSERT INTO respuesta_correcta set ?', [nuevaRespuesta]);
        req.flash('success', 'SE AGREGO RESPUESTA CORRECTA A PREGUNTA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pregunta');
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

//modificar pregunta
router.post('/home/mod_pregunta', async (req,res)=>{
    const {pregunta_idd, pregunta, encuesta_idd}= req.body;
    
    //console.log(pregunta_idd, pregunta, encuesta_idd);    

    try {
        await pool.query('UPDATE pregunta set pregunta = ?, encuesta_idd = ? WHERE idd = ?', [pregunta,encuesta_idd,pregunta_idd]);
        req.flash('success', 'SE MODIFICO PREGUNTA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pregunta');
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

//modificar respuesta
router.post('/home/mod_respuesta', async (req,res)=>{
    const {pregunta_idd,respuesta_idd,respuesta,letra}= req.body;
    
    //console.log(pregunta_idd,respuesta_idd,respuesta,letra);

    try {
        await pool.query('UPDATE respuesta set respuesta = ?, letra = ? WHERE idd = ? and pregunta_idd = ?', [respuesta,letra,respuesta_idd,pregunta_idd]);
        req.flash('success', 'SE MODIFICO RESPUESTA DE PREGUNTA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pregunta');
    } catch (e) {
        res.render('links/error_consulta');
    }  
});

//eliminar pregunta
router.post('/home/eliminar_pregunta', async (req,res)=>{
    const {pregunta_idd}= req.body;
    
    try {
        await pool.query('DELETE FROM pregunta WHERE idd = ?', [pregunta_idd]);
        req.flash('success', 'SE ELIMINO PREGUNTA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pregunta');
    } catch (e) {
        res.render('links/error_eliminarpregunta');
    }
});

//eliminar respuesta
router.post('/home/eliminar_respuesta', async (req,res)=>{
    const {pregunta_idd, respuesta_idd}= req.body;
    
    console.log(pregunta_idd, respuesta_idd);

    try {
        await pool.query('DELETE FROM respuesta WHERE idd = ? and pregunta_idd = ?', [respuesta_idd,pregunta_idd]);
        req.flash('success', 'SE ELIMINO RESPUESTA DE PREGUNTA EXITOSAMENTE!');
        res.redirect('/links/home/crud_pregunta');
    } catch (e) {
        res.render('links/error_eliminarrespuesta');
    }    
});

/**--------------MANTENIMIENTO INVENTOS--------------**/
router.get('/home/mante_invento', async (req,res)=>{

    var consulta="SELECT idd, nombre, anio FROM invento order by nombre asc;";
    const result = await pool.query(consulta);

    var consulta2="SELECT idd, nombre FROM inventor order by nombre asc;";
    const result2 = await pool.query(consulta2);

    var consulta3="\
    select inventor.nombre as 'inventor', invento.nombre as 'invento', invento.anio from inventor\
    join inventado on inventado.inventor_idd = inventor.idd\
    join invento on invento.idd = inventado.invento_idd\
    order by invento.nombre asc;";
    const result3 = await pool.query(consulta3);

    res.render('links/mante_invento', {result,result2,result3});
});

//modificar nombre invento
router.post('/home/cambiar_nominvento', async (req,res)=>{
    const {invento_idd, newnom_invento}= req.body;
    
    //console.log(invento_idd, newnom_invento);    
    
    try {
        await pool.query('UPDATE invento set nombre = ? WHERE idd = ?', [newnom_invento,invento_idd]);
        req.flash('success', 'SE MODIFICO NOMBRE DE INVENTO EXITOSAMENTE!');
        res.redirect('/links/home/mante_invento');
    } catch (e) {
        res.render('links/error_consulta');
    }    
});

//modificar anio invento
router.post('/home/cambiar_anioinvento', async (req,res)=>{
    const {invento_idd, newanio_invento}= req.body;
    
    //console.log(invento_idd, newanio_invento);    
    
    try {
        await pool.query('UPDATE invento set anio = ? WHERE idd = ?', [newanio_invento,invento_idd]);
        req.flash('success', 'SE MODIFICO ANIO DE INVENTO EXITOSAMENTE!');
        res.redirect('/links/home/mante_invento');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//modificar inventor invento
router.post('/home/cambiar_inventorinvento', async (req,res)=>{
    const {invento_idd, inventor_idd, newinventor_idd}= req.body;
    
    //console.log(invento_idd, inventor_idd, newinventor_idd);    
    
    try {
        await pool.query('UPDATE inventado set inventor_idd = ? WHERE inventor_idd = ? and invento_idd = ?', [newinventor_idd,inventor_idd,invento_idd]);
        req.flash('success', 'SE MODIFICO INVENTOR DE INVENTO EXITOSAMENTE!');
        res.redirect('/links/home/mante_invento');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

//agregar inventor a invento
router.post('/home/agregar_inventorinvento', async (req,res)=>{
    const {invento_idd,inventor_idd}= req.body;
    const newInventado = {
        inventor_idd,
        invento_idd
    };

    //console.log(newInventado);

    try {
        await pool.query('INSERT INTO inventado set ?', [newInventado]);
        req.flash('success', 'SE AGREGO INVENTOR A INVENTO EXITOSAMENTE!');
        res.redirect('/links/home/mante_invento');
    } catch (e) {
        res.render('links/error_consulta');
    } 
});


/**--------------MANTENIMIENTO RESPUESTAS CORRECTAS--------------**/
router.get('/home/mante_rescorrec', async (req,res)=>{

    var consulta="SELECT idd, pregunta FROM pregunta order by pregunta asc;";
    const result = await pool.query(consulta);

    var consulta2="SELECT idd, respuesta, letra FROM respuesta order by respuesta asc;";
    const result2 = await pool.query(consulta2);

    var consulta3="\
    select pregunta.pregunta, respuesta.respuesta as 'respuesta_correcta', respuesta.letra\
    from pregunta \
    join respuesta on respuesta.pregunta_idd = pregunta.idd \
    join respuesta_correcta on respuesta_correcta.respuesta_idd = respuesta.idd and respuesta_correcta.pregunta_idd = pregunta.idd\
    order by pregunta.pregunta asc, respuesta.respuesta asc;";
    const result3 = await pool.query(consulta3);

    var consulta4="select pregunta.pregunta, respuesta.respuesta, respuesta.letra from pregunta join respuesta on respuesta.pregunta_idd = pregunta.idd order by pregunta.pregunta asc, respuesta.respuesta asc;";
    const result4 = await pool.query(consulta4);

    res.render('links/mante_rescorrec', {result,result2,result3,result4});
});

//cambiar respuesta correcta
router.post('/home/cambiar_rescorrec', async (req,res)=>{
    const {pregunta_idd, respuesta_idd, newrespuesta_idd}= req.body;
    
    //console.log(pregunta_idd, respuesta_idd, newrespuesta_idd);
        
    try {
        const result1 = await pool.query('SELECT pregunta_idd, respuesta_idd FROM respuesta_correcta where pregunta_idd = ? and (respuesta_idd = ? or respuesta_idd is null or respuesta_idd = \'\');', [pregunta_idd,respuesta_idd]);
        console.log(result1)
        const datos = result1[0]; /*para obtener el id de pregunta y respuesta, para verificar si hay null*/

        if(datos["respuesta_idd"] == null || datos["respuesta_idd"] == ''){
            await pool.query('UPDATE respuesta_correcta set respuesta_idd = ? WHERE pregunta_idd = ?', [newrespuesta_idd,pregunta_idd]);
            req.flash('success', 'SE MODIFOCO RESPUESTA CORRECTA EXITOSAMENTE!');
            res.redirect('/links/home/mante_rescorrec');
        }else{
            await pool.query('UPDATE respuesta_correcta set respuesta_idd = ? WHERE pregunta_idd = ? and respuesta_idd = ?', [newrespuesta_idd,pregunta_idd,respuesta_idd]);
            req.flash('success', 'SE MODIFOCO RESPUESTA CORRECTA EXITOSAMENTE!');
            res.redirect('/links/home/mante_rescorrec');
        }
    } catch (e) {
        res.render('links/error_consulta');
    } 
});

module.exports = router;