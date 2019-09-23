import React, { Component } from 'react'
import { List,  Layout, PageHeader, Button, Icon, Menu, Spin, Divider, Switch, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { db } from '../../firebase.js'

const { SubMenu } = Menu;


/* const data = [
    '1. Racing car sprays burning fuel into crowd.',
    '2. Japanese princess to wed commoner.',
    '3. Australian walks 100km after outback crash.',
    '4. Man charged over missing wedding girl.',
    '5. Los Angeles battles huge wildfires.',
  ];
 */
  

class Archivos extends Component {
    constructor(){
        super();
        this.state = {
            /* archivos:[], */
            videos:[],
            cursoName:'',
            isFetched:false,
            nodata:false
        }
        this.handleDeleteVideo = this.handleDeleteVideo.bind(this)
    }
    componentDidMount() {
        db.collection("Cursos").doc(this.props.match.params.idcurso).get()
        .then(querySnapshotForName => {
            this.setState({
                cursoName:querySnapshotForName.data().title
            })
        })
        .catch((error) =>{
            console.log("Error getting documentoforName: ", error);
        })

        /*-----------------------------------------------------------------------*/

        db.collection("Cursos").doc(this.props.match.params.idcurso).collection('Archivos').orderBy("timestamp", "asc").get()
        .then(querySnapshot => {

            if (querySnapshot.empty) {
                this.setState({
                    isFetched:true,
                    nodata:true
                })
            } else {
                querySnapshot.docs.map( archivo => {
                    db.collection("Cursos").doc(this.props.match.params.idcurso).collection('Archivos').doc(archivo.id).collection('videos').orderBy("timestamp", "asc").get()
                    .then( querySnapshotforVideos =>{
                        this.setState({
                            videos:[...this.state.videos, {doc:querySnapshotforVideos.docs, seccion: archivo.data().seccionName, id:archivo.id}],
                            isFetched:true
                        })
                        
                    })
                })
            }
            
        })
        .catch((error) =>{
            console.log("Error getting documents: ", error);
        })
        /*-----------------------------------------------------------------------*/
    }
    handleDeleteVideo(id) {
        console.log("this log first")
        this.setState({isFetched:false})
        db.collection("Cursos").doc(this.props.match.params.idcurso).collection('Archivos').orderBy("timestamp", "asc").get()
        .then(querySnapshot => {

            querySnapshot.docs.map( archivo => {
                db.collection("Cursos").doc(this.props.match.params.idcurso).collection('Archivos').doc(archivo.id).collection('videos').doc(id).delete()
                .then(()=>{
                    this.state.videos = []
                    db.collection("Cursos").doc(this.props.match.params.idcurso).collection('Archivos').doc(archivo.id).collection('videos').orderBy("timestamp", "asc").get()
                    .then( querySnapshotforVideos =>{
                        this.setState({
                            videos:[...this.state.videos, {doc:querySnapshotforVideos.docs, seccion: archivo.data().seccionName, id:archivo.id}],
                            isFetched:true
                        })
                        
                    })
                })
            })
        })
        console.log("this log second")
        /*after delete().then()*/

        /*when delete() trigger.. handle this.setstate*/


    }

    render() {
        
        return(
            <div>

                
                <PageHeader 
                    title={this.state.cursoName}
                    subTitle="Curriculum"
                    extra={[
                        <Button key='003' type="default" size="small" >
                            <Link to={`/admin/cursos/${this.props.match.params.idcurso}/archivos/nuevaseccion`}>Nueva Seccion</Link>
                        </Button>
                    ]}
                />
                
                <Layout.Content style={{ margin: '24px 16px 0', overflow: 'initial', marginBottom:'1rem' }}>
                    {this.state.isFetched ? (this.state.nodata ? <Empty/>: this.state.videos.map( (archivo,key) => {
                        return(
                            <div key={key}>
                                <PageHeader   title={archivo.seccion}
                                        style={{ background:'rgba(0,0,0,0.1)' }}
                                        /* subTitle="Lista de Cursos" */
                                        extra={[
                                            <Button key={key} type="primary" size="small" >
                                                <Link to={`/admin/cursos/${this.props.match.params.idcurso}/archivos/${archivo.id}/nuevoarchivo`}>
                                                    <span style={{ fontSize:'0.8rem' }}>Nuevo Archivo</span>
                                                </Link>
                                            </Button>
                                        ]}
                                />
                                <div style={{ padding: 24, background: '#fff'}}>
                                    {archivo.doc.map( (video, index) => (
                                        <List
                                        key={index}
                                        size="small"
                                        bordered
                                        dataSource={[video]}
                                        renderItem={item => <List.Item style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                                                <div style={{ display:'flex', alignItems:'center', flexWrap:'nowrap'}}>
                                                                    <Icon type="cloud-server" style={{marginRight:'0.8rem', color:'#000' }} />
                                                                    <p style={{ margin:'0', fontWeith:'700'}}>{item.data().title}</p>
                                                                </div>
                                                                <div>
                                                                    <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                                                                        <Divider type="vertical" />
                                                                    <Icon onClick={() => this.handleDeleteVideo(video.id)} type="delete" style={{marginRight:'0.8rem', color:'red' }} />
                                                                    <Divider type="vertical" />
                                                                    <Switch
                                                                    checkedChildren={<Icon type="check" />}
                                                                    unCheckedChildren={<Icon type="close" />}
                                                                    defaultChecked
                                                                    />
                                                                </div>
                                                            </List.Item>}
                                    />
                                    ))}
                                </div>
                            </div>

                        )
                    }))
                :<Spin size="large" style={{display:'flex', justifyContent:'center', alignItems:'center'}} />}
                    
                    <br/>
                </Layout.Content>
            </div>

        )
    }
}

export default Archivos